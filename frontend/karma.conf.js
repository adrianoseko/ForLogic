// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

"use strict";

const path = require('path');
const { defineConfig } = require('karma');

/**
 * Build and return a Karma configuration object.
 *
 * Notes:
 * - This file intentionally preserves the original behavior and defaults used
 *   by the project's tests.
 * - Security guidance: Authentication/authorization for API/controller
 *   endpoints should be implemented on the server side (e.g. JWT or
 *   cookie-based auth with CSRF protections and role-based policies).
 *   CORS should be restricted to known origins in production and dev/prod
 *   configuration should be separated. Those concerns are outside Karma's
 *   scope and must be applied in your backend configuration.
 *
 * @returns {object} Karma configuration
 */
function buildKarmaConfig() {
  const coverageDirectory = path.join(__dirname, './coverage/angularproj');

  // Keep same default values as original configuration to preserve behavior
  const karmaCfg = defineConfig({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      // leave Jasmine Spec Runner output visible in browser
      clearContext: false
    },
    coverageIstanbulReporter: {
      dir: coverageDirectory,
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    // The original configuration referenced `config.LOG_INFO`. To preserve
    // identical behavior we keep that reference here. Karma will provide the
    // `config` symbol when running.
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });

  return karmaCfg;
}

try {
  // Build configuration and export. If an unexpected error occurs, log it
  // and rethrow to avoid masking startup problems.
  const karmaConfig = buildKarmaConfig();
  module.exports = karmaConfig;
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Failed to construct Karma configuration:', err);
  // Re-throw to avoid silently ignoring configuration problems.
  throw err;
}
