const { library } = require('./build.json');

module.exports = {
  alias: {
    '@': './src/components',
  },
  plugins: [
    [
      '@gant-lowcode/build-plugin-lowcode',
      {
        library,
        baseLibrary: 'rax',
        engineScope: "<%= arguments[0].engineScope || '@ali' %>"
      }
    ],
  ],
};
