// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    keys(): string[];
    <T>(id: string): T;
  };
};

/**
 * Initializes the Angular testing environment.
 */
function initializeTestingEnvironment(): void {
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
}

/**
 * Loads all test modules from the specified context.
 */
function loadTestModules(): void {
  const context = require.context('./', true, /\.spec\.ts$/);
  context.keys().forEach(context);
}

// Initialize the Angular testing environment and load the test modules.
initializeTestingEnvironment();
loadTestModules();
