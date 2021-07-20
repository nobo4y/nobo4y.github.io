const path = require('path');
module.exports = {
  port: 4000,
  assets: './assets/',

  bs: {
    nofity: true
  },

  sass: {
    src: '_sass/**/*.scss',
    dest: 'css',
    outputStyle: 'compressed',
  },

  js: {
    src: 'js/**/*',
    dest: 'js',
    entry: 'bundle.js'
  },

  imagemin: {
    src: 'images/**/*',
    dest: 'images',
    interlaced: false,
    verbose: false,
  mozjpeg:{
      quality: 75,
      progressive: true,
    },
    optimizationLevel: 2,
  },

  jekyll: {
    config: {
      default: '_config.yml',
      development: '_config_development.yml',
      production: '',
    },
    dest: '_site',
    watch: [
      './_data/**/*',
      './_includes/**/*',
      './_layouts/**/*',
      './_posts/**/*',
      './collections/**/*',
      './_config*yml',
      '*.html',
      '*.md',
      '*.markdown'
    ]
  },
};
