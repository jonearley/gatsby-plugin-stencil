// @ts-check
const util = require("util");
const glob = util.promisify(require("glob"));
const fs = require("fs");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

/*
  Server side render Stencil web components
*/
exports.onPostBuild = async ({ reporter }, pluginOptions) => {
  let packages = pluginOptions.module;
  if (!Array.isArray(pluginOptions.module)) {
    packages = [pluginOptions.module];
  }

  const files = await glob("public/**/*.html", { nodir: true });

  const renderToStringOptions = pluginOptions.renderToStringOptions
    ? pluginOptions.renderToStringOptions
    : {};

  async function preRenderPage(file, hydrate, pkg) {
    try {
      const page = await readFile(file, "utf-8");
      const { html, diagnostics = [] } = await hydrate.renderToString(
        page,
        renderToStringOptions
      );

      diagnostics.forEach((diagnostic) =>
        reporter.error(
          `error pre-rendering file: ${file} with ${pkg}. ${JSON.stringify(
            diagnostic,
            null,
            "  "
          )}`
        )
      );

      await writeFile(file, html);
    } catch (e) {
      reporter.error(
        `error pre-rendering file: ${file} with ${pkg}. ${e.message}`
      );
    }
  }

  async function preRenderPackage(pkg) {
    const hydrate = require(`${pkg}/hydrate`);
    await Promise.all(files.map((file) => preRenderPage(file, hydrate, pkg)));
    reporter.info(`pre-rendered ${pkg}`);
  }

  return Promise.all(packages.map(preRenderPackage));
};
