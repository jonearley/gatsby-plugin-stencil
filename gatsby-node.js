const glob = require("glob");
const fs = require("fs");

const getStencilErrors = (result) =>
  result.diagnostics
    ? result.diagnostics.find((diagnostic) => diagnostic.level === "error")
    : [];

/*
  Server side render Stencil web components
*/
exports.onPostBuild = async ({}, pluginOptions) => {
  const stencil = require(pluginOptions.module + "/hydrate");
  const files = glob.sync("public/**/*.html");
  return Promise.all(
    files.map(async file => {
      try {
        const html = fs.readFileSync(file, "utf8");
        const result = await stencil.renderToString(html, {
          prettyHtml: true
        });

        if (result.html === null) {
          const errors = getStencilErrors(result);
          if (errors.length) {
            throw new Error(`${errors[0].header}: ${errors[0].messageText}`);
          } else {
            throw new Error(
              "An unexpected error occured whilst executing stencil.renderToString()"
            );
          }
        }
        fs.writeFileSync(file, result.html);
        return result;
      } catch (e) {
        // Ignore error where path is a directory
        if (e.code === "EISDIR") {
          return;
        }

        throw e;
      }
    })
  );
};
