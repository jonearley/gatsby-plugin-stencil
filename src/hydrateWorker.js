const { workerData, parentPort } = require("worker_threads");
const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const { files, workerId, pkg, renderToStringOptions } = workerData;
const hydrate = require(`${pkg}/hydrate`);

/**
 * Loops over files and awaits processing of each.
 *
 * @param {*} files
 * @returns
 */
const chunkFiles = async (files) => {
  let filesProcessed = 0;
  for (var i = 0; i < files.length; i++) {
    filesProcessed++;
    await processFile(files[i]).catch((e) => console.error(e));
  }
  return filesProcessed;
};

/**
 * Performs Stencil package's renderToString on file path passed in.
 *
 * @param {*} file
 */
const processFile = async (file) => {
  const page = await readFile(file, "utf8");
  const { html, diagnostics = [] } = await hydrate.renderToString(
    page,
    renderToStringOptions
  );

  diagnostics.forEach((diagnostic) =>
    console.error(
      `error pre-rendering file: ${file}. ${JSON.stringify(
        diagnostic,
        null,
        "  "
      )}`
    )
  );

  if (html) {
    await writeFile(file, html);
  }
};

/**
 * Loops over batch of files provided to this worker passing to handler that hyrdates
 * @param {*} files
 */
const processFiles = async (files) => {
  const chunkSize = 10;
  let loop = 0;
  let position = 0;
  let filesProcessed = 0;
  while (files.length > position) {
    position = loop * chunkSize;
    if (position + chunkSize > files.length) {
      filesProcessed += await chunkFiles(files.slice(position, files.length));
    } else {
      filesProcessed += await chunkFiles(
        files.slice(position, position + chunkSize)
      );
    }
    loop++;
  }

  // const used = process.memoryUsage().heapUsed / 1024 / 1024;
  // console.info(`${workerId} - Finished processing ${filesProcessed}. Mem used ${Math.round(used * 100) / 100} MB.`);
  parentPort.postMessage({
    //send message with the result back to the parent process
    filesProcessed: filesProcessed,
  });
};

processFiles(files);
