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
      },
    },
  ],
};
```
