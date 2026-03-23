/**
 * Polyfills for Angular applications.
 *
 * Purpose:
 *  - Include browser polyfills required by Angular and loaded before the app.
 *  - Split into 2 logical sections: browser polyfills and application imports.
 *
 * Notes:
 *  - This file targets evergreen browsers (recent versions that auto-update).
 *  - Keep this file minimal: only import what you need.
 *  - To change Zone.js patch behavior, create a separate zone-flags.ts and import it
 *    above the Zone.js import (see the example below).
 *
 * Security guidance (informational only - implement in app/back-end configuration):
 *  - Authentication and authorization are not implemented in this file. Implement
 *    JWT or HttpOnly cookie-based authentication on the server, with CSRF protection
 *    if you use cookies. Enforce role-based authorization in both the back-end
 *    (controller endpoints) and front-end route guards.
 *  - Restrict CORS to known origins in production. Do not use AllowAll in production
 *    settings. Keep dev and production CORS configuration separated and stored
 *    securely (environment variables or secure configuration stores).
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/**
 * Example: IE11 support for NgClass on SVG elements.
 * Uncomment and install if you need it:
 *   npm install --save classlist.js
 */
// import 'classlist.js';

/**
 * Example: Web Animations polyfill for AnimationBuilder on older browsers.
 * Uncomment and install if you need it:
 *   npm install --save web-animations-js
 */
// import 'web-animations-js';

/**
 * Zone.js configuration flags (optional):
 * To customize what Zone.js patches, create a file named zone-flags.ts in this
 * directory and set the flags before importing Zone.js. For example:
 *
 * // zone-flags.ts
 * // (window as any).__Zone_disable_requestAnimationFrame = true;
 * // (window as any).__Zone_disable_on_property = true;
 * // (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove'];
 *
 * Then import it here (above the Zone.js import):
 * import './zone-flags';
 *
 * Keep any flags in a separate file so webpack places the import at the top
 * of the bundle as required.
 */

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js/dist/zone';  // Included with Angular CLI.

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

// Add any imports for files that must be loaded after Zone.js and before your
// main entry point here. Keep polyfills minimal to reduce bundle size.
