var webpack = require('webpack');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var precss = require('precss');
var autoprefixer = require('autoprefixer');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var version = require('./package.json').version;

// Entrada do programa
var entrada =  __dirname + '/src/index.js';

// Arquivo de saída
var saida =  {
  filename: 'page/[name]/index.js',
  chunkFilename: 'chunk/[name].[chunkhash:5].chunk.js',
};

// Gerar source-map para rastreamento de erros de js
var ferramentaDev = 'source-map';

// eslint
var eslint =  {
  configFile: __dirname + '/.eslintrc.js',
}

// loader
var carregadores = [
    {
      test: /\.(json)$/,
      exclude: /node_modules/,
      loader: 'json',
    },
    {
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel!eslint-loader',
    },
    {
      test: /\.(?:png|jpg|gif)$/,
      loader: 'url?limit=8192', // Arquivos menores que 8k serão embutidos; maiores que 8k serão gerados como arquivo
    },
    {
      test: /\.less/,
      loader: ExtractTextPlugin.extract('style', 'css?modules&localIdentName=[hash:base64:4]!postcss!less'),
    }
];

// Plugins de desenvolvimento
var pluginsDev =  [
  new CopyWebpackPlugin([
    { from: './src/resource/music/music.mp3' },
    { from: './src/resource/css/loader.css' },
  ]),
  // Hot module replacement
  new webpack.HotModuleReplacementPlugin(),
  // Permitir erros sem interromper o programa, necessário apenas no modo de desenvolvimento
  new webpack.NoErrorsPlugin(),
  // Abrir página no navegador
  new OpenBrowserPlugin({
    url: 'http://127.0.0.1:8080/'
  }),
  // Empacotar CSS
  new ExtractTextPlugin('css.css', {
    allChunks: true
  }),
]

// Plugins de produção
var pluginsProducao = [
  // Definir ambiente de produção
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': '"production"',
  }),
  // Copiar arquivos
  new CopyWebpackPlugin([
    { from: './src/resource/music/music.mp3' },
    { from: './src/resource/css/loader.css' },
  ]),
  // Template HTML
  new HtmlWebpackPlugin({
    template: __dirname + '/server/index.tmpl.html'
  }),
  // Minificar JS
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }}
  ),
  // Empacotar CSS
  new ExtractTextPlugin('css-' + version + '.css', {
    allChunks: true
  }),
];

// Servidor de desenvolvimento
var servidorDev = {
  contentBase: './server',
  colors: true,
  historyApiFallback: false,
  port: 8080, // padrão é "8080"
  hot: true, // Hot Module Replacement
  inline: true, // Livereload
  host: '0.0.0.0',
  disableHostCheck: true
};

module.exports = {
  entry: entrada,
  devtool: ferramentaDev,
  output: saida,
  loaders: carregadores,
  devPlugins: pluginsDev,
  productionPlugins: pluginsProducao,
  devServer: servidorDev,
  postcss: function () {
    return [precss, autoprefixer];
  },
  version: version
};
