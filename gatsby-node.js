const glob = require("glob");

const { hydrateFiles } = require("./src/hydrateFiles");
/*
  Server side render Stencil web components
*/
exports.onPostBuild = async ({ reporter }, pluginOptions) => {
  let packages = pluginOptions.module;
  if (!Array.isArray(pluginOptions.module)) {
    packages = [pluginOptions.module];
  }

  // Could still experience mem issues with this but would require a lot of files
  const files = glob.sync("public/**/*.html", { nodir: true });
  reporter.info("Stencil hydration starting");
  for (let i = 0; i < packages.length; i++) {
    if (files.length > 0) {
      await hydrateFiles(files, packages[i], reporter, pluginOptions);
    } else {
      reporter.error("No files found to hyrdate");
    }
    reporter.info(`Package hydrated ${packages[i]}`);
  }
  reporter.success("All Stencil packages hydrated");
};
