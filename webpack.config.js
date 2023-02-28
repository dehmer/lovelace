const path = require('path')
const { spawn } = require('child_process')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const mode = process.env.NODE_ENV || 'development'
const production = mode === 'production'
const development = mode === 'development'

const js = {
  test: /\.js$/,
  exclude: /node_modules/,
  use: ['babel-loader']
}

const css = {
  // css-loader: resolve/load required/imported CSS dependencies from JavaScript
  // style-loader: wrap CSS string from css-loader with <style> tag
  // Note: loaders are applied from right to left, i.e. css-loader -> style-loader
  //
  test: /\.(scss|css)$/,
  use: [
    production
      ? MiniCssExtractPlugin.loader
      : 'style-loader',
    'css-loader',
    'sass-loader'
  ]
}

const image = {
  test: /\.(png|svg|jpe?g|gif)$/i,
  use: [{
    loader: 'file-loader',
    options: {
      name: 'img/[name].[ext]'
    }
  }]
}

const font = {
  test: /\.(eot|svg|ttf|woff|woff2)$/,
  type: 'asset/resource'
}

const svelte = [
  {
    test: /\.svelte$/,
    use: {
      loader: 'svelte-loader',
      options: {
        compilerOptions: { dev: development },
        emitCss: production,
        hotReload: development
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

const rules = [js, css, image, font, ...svelte]


const renderer = {
  context: path.resolve(__dirname, 'src/renderer'),
  target: 'electron-renderer',

  // In production mode webpack applies internal optimization/minification:
  // no additional plugins necessary.
  // For advanced options: babel-minify-webpack-plugin:
  // https://webpack.js.org/plugins/babel-minify-webpack-plugin

  mode,
  stats: 'errors-only',
  module: { rules },
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

    // Warning
    // Source maps works only for source-map,
    // nosources-source-map, hidden-nosources-source-map,
    // hidden-source-map values because CSS only supports
    // source maps with the sourceMappingURL comment
    // (i.e. //# sourceMappingURL=style.css.map). If you need set
    // devtool to another value you can enable source maps generation
    // for extracted CSS using sourceMap: true for css-loader.
    //
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      title: 'Electron/Svelte Template'
    })
  ]
}

const main = {
  context: path.resolve(__dirname, 'src/main'),
  target: 'electron-main',
  mode,
  stats: 'errors-only',
  entry: { main: './main.js' },
  plugins: [
    // NOTE: Required. Else "Error: No native build was found for ..."
    new webpack.ExternalsPlugin('commonjs', ['level'])
  ]
}

const server = {
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
}

module.exports = [
  main,
  Object.assign(
    {},
    renderer,
    development ? server : {},
    // See restrictions on MiniCssExtractPlugin.
    { devtool: production ? false : 'source-map' }
  )
]
