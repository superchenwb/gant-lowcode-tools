import WebpackChain from 'webpack-chain';
import { PluginContext } from 'build-scripts/lib';
import MomentLocalesPlugin from 'moment-locales-webpack-plugin';
import * as path from 'path';

interface IOptions extends Partial<PluginContext> {
  entry: object;
  type: string;
  mainFile: string;
  generateMeta?: boolean;
}

export default (config: WebpackChain, { rootDir, entry, type, pkg, mainFile, generateMeta }: IOptions) => {
  config.target('web');
  config.context(rootDir);
  config.merge({
    entry,
  });
  config.output.filename('[name].js');
  // remove CopyWebpackPlugin (component compile do not have public folder)
  config.plugins.delete('CopyWebpackPlugin');
  config.node.set('fs', 'empty');

  // disable vendor
  config.optimization.splitChunks({ cacheGroups: {} });

  config.plugin('momentLocale').use(MomentLocalesPlugin, [{
    localesToKeep: ['en', 'zh-cn']
  }]);


  // config.resolve.modules
  //   .add(path.join(rootDir, 'node_modules'))
  //   .add('node_modules')
  //   .add(path.join(__dirname, '../node_modules'));

  config.resolve.alias.set(`__lowcode-${type}-demo__`, path.join(rootDir, 'src/index'));

  config.externals({
    "react": "var window.React",
    "react-dom": "var window.ReactDOM",
    "prop-types": "var window.PropTypes",
    "@alifd/next": "var window.Next",
    "@gant-lowcode/lowcode-engine": "var window.GantLowCodeEngine",
    "@gant-lowcode/lowcode-engine-ext": "var window.GantLowCodeEngineExt",
    "monaco-editor/esm/vs/editor/editor.api": "var window.monaco",
    "monaco-editor/esm/vs/editor/editor.main.js": "var window.monaco",
    "@gant-lowcode/lowcode-editor-skeleton": "var window.GantLowCodeEngine.common.skeletonCabin",
    "@gant-lowcode/lowcode-editor-core": "var window.GantLowCodeEngine.common.editorCabin",
    "@gant-lowcode/lowcode-designer": "var window.GantLowCodeEngine.common.designerCabin",
  });


  // see https://github.com/webpack/webpack/releases/tag/v4.0.0 for details
  config.module.rule('mjs2js')
    .test(/\.mjs$/)
    .include
    .add(/node_modules/)
    .end()
    .type('javascript/auto');

  if (type === 'plugin' && generateMeta && pkg.lcMeta) {
    ['tsx', 'jsx'].forEach((ruleName) => {
      config.module.rule(ruleName).use('babel-loader').tap((options) => {
        return {
          ...options,
          plugins: [
            ...options.plugins,
            [require.resolve('./babelPluginMeta'), {
              filename: mainFile,
              meta: pkg.lcMeta,
            }],
          ]
        }
      })
    })
  }
  
}