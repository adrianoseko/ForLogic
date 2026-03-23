// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

'use strict';

const { SpecReporter, StacktraceOption } = require('jasmine-spec-reporter');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * @type { import("protractor").Config }
 */
const DEFAULT_SPEC = './src/**/*.e2e-spec.ts';
const DEFAULT_BASE_URL = 'http://localhost:4200/';
const DEFAULT_AUTH_URL = process.env.E2E_AUTH_URL || 'http://localhost:3000/api/auth';
const DEFAULT_ROLE_CREDENTIALS = {
  admin: { username: process.env.E2E_ADMIN_USER || 'admin', password: process.env.E2E_ADMIN_PASS || 'admin' },
  user: { username: process.env.E2E_USER || 'user', password: process.env.E2E_USER_PASS || 'user' }
};

const protractorConfig = {
  allScriptsTimeout: 11000,
  specs: [ process.env.E2E_SPECS || DEFAULT_SPEC ],
  capabilities: { browserName: 'chrome' },
  directConnect: true,
  baseUrl: process.env.E2E_BASE_URL || DEFAULT_BASE_URL,
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: () => {}
  },
  onPrepare: async () => {
    registerTypeScript();
    setupJasmineReporter();
    attachE2EHelpers();
  }
};

function registerTypeScript() {
  try {
    require('ts-node').register({
      project: path.join(__dirname, './tsconfig.json')
    });
  } catch (err) {
    console.error('Failed to register ts-node for e2e tests:', err && err.stack ? err.stack : err);
    throw err;
  }
}

function setupJasmineReporter() {
  if (typeof jasmine === 'undefined' || !jasmine.getEnv) {
    console.warn('Jasmine environment not detected. Skipping reporter setup.');
    return;
  }
  jasmine.getEnv().addReporter(new SpecReporter({
    spec: { displayStacktrace: StacktraceOption.PRETTY }
  }));
}

// Minimal HTTP POST helper without external deps
function postJson(urlString, payload, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(urlString);
      const isHttps = urlObj.protocol === 'https:';
      const data = Buffer.from(JSON.stringify(payload || {}));
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + (urlObj.search || ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        },
        timeout: timeoutMs
      };
      const transport = isHttps ? https : http;
      const req = transport.request(options, (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({ statusCode: res.statusCode, body: parsed });
          } catch (parseErr) {
            // return raw body if JSON parsing fails
            resolve({ statusCode: res.statusCode, body });
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy(new Error('Request timed out'));
      });
      req.write(data);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Attach helpers to the global scope for e2e tests to use
function attachE2EHelpers() {
  if (typeof global === 'undefined') return;
  global.e2eHelpers = {
    getAuthToken: async (username, password) => {
      const authUrl = process.env.E2E_AUTH_URL || DEFAULT_AUTH_URL;
      try {
        const payload = { username, password };
        const result = await postJson(authUrl, payload);
        if (result && result.statusCode >= 200 && result.statusCode < 300) {
          // Try common locations for token
          if (result.body && typeof result.body === 'object') {
            if (result.body.token) return result.body.token;
            if (result.body.accessToken) return result.body.accessToken;
            // If body directly is token string
            if (typeof result.body === 'string') return result.body;
          }
        }
        throw new Error('Authentication failed: unexpected response');
      } catch (err) {
        console.error('getAuthToken error:', err && err.stack ? err.stack : err);
        throw err;
      }
    },
    setAuthInBrowser: async (token, options = { storage: 'localStorage', key: 'auth_token' }) => {
      if (!global.browser) {
        throw new Error('Protractor browser global is not available');
      }
      const storageKey = options.key || 'auth_token';
      const script = (t, key, storage) => {
        if (storage === 'cookie') {
          document.cookie = `${key}=${t}; path=/; secure; samesite=strict`;
          return true;
        }
        try {
          window.localStorage.setItem(key, t);
          return true;
        } catch (e) {
          return false;
        }
      };
      return await global.browser.executeScript(script, token, storageKey, options.storage);
    },
    loginAsRole: async (role) => {
      const creds = DEFAULT_ROLE_CREDENTIALS[role] || { username: role, password: role };
      const token = await global.e2eHelpers.getAuthToken(creds.username, creds.password);
      await global.e2eHelpers.setAuthInBrowser(token);
      return token;
    }
  };
  // Provide shorthand directly on global
  global.getE2EToken = global.e2eHelpers.getAuthToken;
  global.loginE2E = global.e2eHelpers.loginAsRole;
  // Note: Tests should call await global.loginE2E('admin') before navigating to protected pages.
}

/*
  Security and environment notes:
  - E2E tests can obtain real JWTs from AUTH endpoint by setting E2E_AUTH_URL and credentials via environment variables.
  - Do not leave permissive CORS or AllowAll policies enabled in production. Configure known origins for your backend based on NODE_ENV.
  - Example (server-side): allow origins from process.env.ALLOWED_ORIGINS.split(',') when NODE_ENV === 'production'.
  - Keep secrets and credentials out of source control; use CI/CD secret stores for E2E credentials.
*/

module.exports.config = protractorConfig;
