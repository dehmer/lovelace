const path = require('path')
const { spawn } = require('child_process')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require("copy-webpack-plugin")
const webpack = require('webpack')

const mode = env => env.production ? 'production' : 'development'

const rules = (env) => [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: ['babel-loader']
  },

  {
    // css-loader: resolve/load required/imported CSS dependencies from JavaScript
    // style-loader: wrap CSS string from css-loader with <style> tag
    // Note: loaders are applied from right to left, i.e. css-loader -> style-loader
    //
    test: /\.(scss|css)$/,
    use: ['style-loader', 'css-loader', 'sass-loader']
  },

  {
    test: /\.(png|svg|jpe?g|gif)$/i,
    use: [{
      loader: 'file-loader',
      options: {
        name: 'img/[name].[ext]'
      }
    }]
  },

  {
    test: /\.(eot|svg|ttf|woff|woff2)$/,
    type: 'asset/resource'
  },

  {
    test: /\.svelte$/,
    use: {
      loader: 'svelte-loader',
      options: {
        compilerOptions: { dev: mode(env) !== 'production' },
        emitCss: mode(env) === 'production',
        hotReload: mode(env) !== 'production'
      }
    }
  },

  {
    // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
    test: /node_modules\/svelte\/.*\.mjs$/,
    resolve: {
      fullySpecified: false
    }
  }
]

const rendererConfig = (env, argv) => ({
  context: path.resolve(__dirname, 'src/renderer'),
  target: 'electron-renderer',

  // In production mode webpack applies internal optimization/minification:
  // no additional plugins necessary.
  // For advanced options: babel-minify-webpack-plugin:
  // https://webpack.js.org/plugins/babel-minify-webpack-plugin

  mode: mode(env),
  stats: 'errors-only',
  module: { rules: rules(env) },
  entry: { renderer: ['./renderer.js'] },

  node: { global: true },

  resolve: {
		alias: {
			svelte: path.dirname(require.resolve('svelte/package.json'))
		},
		extensions: ['.mjs', '.js', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main'],
    conditionNames: ['svelte']
	},

  plugins: [
    new webpack.ExternalsPlugin('commonjs', ['level']),
    new MiniCssExtractPlugin({ filename: '[name].css' }),
    new CopyPlugin({
      patterns: [
        { from: "index.html" },
        { from: "global.scss" },
        { from: "favicon.png" }
      ]
    })
  ]
})

const mainConfig = (env, argv) => ({
  context: path.resolve(__dirname, 'src/main'),
  target: 'electron-main',
  mode: mode(env),
  stats: 'errors-only',
  entry: { main: './main.js' },
  plugins: [
    // NOTE: Required. Else "Error: No native build was found for ..."
    new webpack.ExternalsPlugin('commonjs', ['level'])
  ]
})

const devServer = env => {
  if (env.production) return ({}) // no development server for production
  return ({
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist')
      },
      setupMiddlewares: (middlewares, devServer) => {
        spawn(
          'electron',
          ['.'],
          { shell: true, env: process.env, stdio: 'inherit' }
        )
          .on('close', code => process.exit(code))
          .on('error', error => console.error(error))

        return middlewares
      }
    }
  })
}

const devtool = env => {
  if (env.production) return ({}) // no source maps for production
  return ({
    devtool: 'cheap-source-map'
  })
}

module.exports = (env, argv) => {
  env = env || {}

  // Merge development server and devtool to renderer configuration when necessary:
  const renderer = Object.assign(
    {},
    rendererConfig(env, argv),
    devServer(env),
    devtool(env)
  )

  const main = mainConfig(env, argv)
  return [renderer, main]
}
