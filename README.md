# gatsby-plugin-stencil

Gatsby server side rendering for your Stencil web components.

## Install

```
npm install --save gatsby-plugin-stencil
```

## How to use

**Note**: Make sure you you have added the [`dist-hydrate-script` as output target](https://stenciljs.com/docs/hydrate-app) to your Stencil library

Add the plugin to your `gatsby-config.js`

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-stencil`,
      options: {
        // The module of your components (required), eg "@ionic/core".
        // Add multiple modules by using an array eg ["@ionic/core", "my-stencil-components"]
        module: "your-stencil-components-package",

        // Stencil renderToString options (optional): https://stenciljs.com/docs/hydrate-app#configuration-options
        renderToStringOptions: {
          prettyHtml: true,
        },
        // Number of workers to spin up (optional). Will default to half the number of CPUs detected via os.cpus()
        numberOfWorkers: 4,
        // Number of files to pass to each worker (optional). Will default to 100
        workerChunkSize: 100,
      },
    },
  ],
};
```
