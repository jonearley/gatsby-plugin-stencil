const { Worker } = require("worker_threads");
const { performance } = require("perf_hooks");

/**
 * Creates worker_threads and returning a promise for each thread.
 *
 * Promises resolve based on worker completing successfully,
 * or rejects with an error if failure.
 *
 * @param {*} data
 * @returns
 */
const runWorker = (data, reporter) => {
  return new Promise((resolve, reject) => {
    //Create worker, passing in data
    const worker = new Worker(`${__dirname}/hydrateWorker.js`, {
      workerData: data,
    });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reporter.error(`Worker exited with an error ${code}`);
        reject(new Error(`Worker stopped with exit code ${code}`));
      } else {
        // reporter.info("Worker completed.");
        resolve;
      }
    });
  });
};

/**
 * Wrapper for runWorker.
 *
 * Based on numWorkers and files left to process it calls
 * runWorker passing necessary workerData to create worker_threads.
 *
 * @param {*} files
 * @param {*} numWorkers
 * @param {*} pkg
 * @param {*} renderToStringOptions
 * @param {*} reporter
 * @returns
 */
const createWorkers = async (
  files,
  numWorkers,
  pkg,
  renderToStringOptions,
  reporter
) => {
  //divide work among workers
  const batchSize = Math.floor(files.length / numWorkers);
  const workerPromises = [];
  for (var i = 0; i < numWorkers; i++) {
    workerPromises.push(
      runWorker(
        {
          files: files.slice(i * batchSize, (i + 1) * batchSize),
          workerId: i + 1,
          pkg,
          renderToStringOptions,
        },
        reporter
      )
    );
  }
  reporter.info(`Spawned ${i} workers`);

  return Promise.all(workerPromises);
};

/**
 * Loops over all files passed in, sets up initial config and
 * passes through hyrdate options and stencil pkg to the handlers.
 *
 * @param {*} files
 * @param {*} pkg
 * @param {*} reporter
 * @param {*} config
 */
exports.hydrateFiles = async (files, pkg, reporter, config) => {
  const os = require("os");
  let numWorkers = os.cpus().length / 2;

  if (config.numberOfWorkers) {
    numWorkers = config.numberOfWorkers;
  }

  let chunkSize = numWorkers * 100;
  if (config.workerChunkSize) {
    chunkSize = numWorkers * config.workerChunkSize;
  }

  const renderToStringOptions = config.renderToStringOptions
    ? config.renderToStringOptions
    : {};

  reporter.info(
    `Using ${numWorkers} workers with a chunkSize of ${chunkSize / numWorkers}`
  );

  let leftToProcess = files.length;
  let start = 0;
  let end = 0;
  let loop = 0;

  let overallStartTime = performance.now();
  //Whilst we still have files:
  while (leftToProcess > 0) {
    reporter.info(`Files still to process ${leftToProcess}`);
    start = loop * chunkSize;
    end = start + chunkSize;
    if (end > files.length) {
      end = start + leftToProcess;
    }
    let startTime = performance.now();
    await createWorkers(
      files.slice(start, end),
      numWorkers,
      pkg,
      renderToStringOptions,
      reporter
    );
    let endTime = performance.now();
    reporter.info(
      `Processing ${end - start} files took ${(
        (endTime - startTime) /
        1000
      ).toFixed(2)}s`
    );
    leftToProcess = leftToProcess - (end - start);
    loop++;
  }
  let overallEndTime = performance.now();

  reporter.success(
    `Processing ${files.length} files took ${(
      (overallEndTime - overallStartTime) /
      1000
    ).toFixed(2)}s`
  );
};
