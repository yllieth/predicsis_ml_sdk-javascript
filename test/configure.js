// http://karma-runner.github.io/0.10/config/configuration-file.html
module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['jasmine'],
    files: [
      // requested vendor
      'vendor/angular/angular.js',
      'vendor/angular-mocks/angular-mocks.js',
      'vendor/restangular/dist/restangular.js',
      'vendor/lodash/lodash.js',

      // tested files
      'lib/predicsis-jsSDK.js',
      'lib/**/*.js',

      // test files
      'test/unit/model/*.js'
    ],

    exclude: [],
    port: 8080,
    logLevel: config.LOG_INFO, // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    autoWatch: false,
    browsers: ['PhantomJS'], // Chrome, ChromeCanary, Firefox, Opera, Safari (Mac only), PhantomJS, IE (Windows only)
    singleRun: true
  });
};
