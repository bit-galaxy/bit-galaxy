const webpack = require('webpack');
const path    = require('path');
const plugins = require('webpack-load-plugins')({
  rename: {
    'html-webpack-plugin': 'Html',
    'favicons-webpack-plugin': 'Favicons',
  },
});

const APP_DIR     = path.resolve(__dirname, 'src');
const MODULES_DIR = path.resolve(__dirname, 'node_modules');

const standardPlugins = [
  new plugins.Html({
    template: `${APP_DIR}/index.html`,
    minify: {
      collapseWhitespace: true,
      minifyJS: { mangle: false },
    },
  }),
  new plugins.Favicons({
    logo: `${APP_DIR}/favicon.png`,
    prefix: 'build/icons/',
    icons: {
      android: false,
      appleIcon: false,
      appleStartup: false,
      coast: false,
      favicons: true,
      firefox: false,
      opengraph: false,
      twitter: false,
      yandex: false,
      windows: false,
    },
  }),
];

const config = {
  entry: [
    `${APP_DIR}/controller.js`,
  ],
  output: {
    path: __dirname,
    filename: 'build/bundle.js',
    publicPath: '/bit-galaxy',
  },
  plugins: (process.env.NODE_ENV === 'production') ? [
    ...standardPlugins,
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
    }),
  ] : [
    ...standardPlugins,
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-2'],
        },
        exclude: [MODULES_DIR],
      },
      { test: /\.css$/, loader: 'css-loader' },
    ],
  },
};

module.exports = config;
