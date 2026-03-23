import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';

/**
 * Route-level authentication metadata. A centralized Auth/Role guard should read
 * these properties from route.data to enforce authentication and authorization.
 *
 * Notes for implementers:
 * - Implement a global AuthGuard and RoleGuard in a central auth module that
 *   inspects route.data.requiresAuth and route.data.allowedRoles.
 * - Do NOT apply guards here to the login route, it must remain publicly accessible.
 * - Keep CORS and other server-side policies configured on the backend. Use
 *   environment-specific configuration (dev vs prod) to restrict origins in
 *   production; avoid AllowAll in production settings.
 */
export interface RouteAuthData {
  requiresAuth?: boolean;
  allowedRoles?: string[];
}

/**
 * Use a constant for the path to avoid hard-coded string spread across the app.
 */
export const LOGIN_ROUTE_PATH = 'login';

export const loginRoutes: Routes = [
  {
    path: LOGIN_ROUTE_PATH,
    component: LoginComponent,
    // Explicit metadata so centralized guards can decide behavior without
    // changing this file. Keep the login route publicly accessible.
    data: {
      requiresAuth: false
    } as RouteAuthData
  }
];

@NgModule({
  // Routing modules shouldn't import CommonModule unless they declare components.
  imports: [RouterModule.forChild(loginRoutes)],
  exports: [RouterModule]
})
export class LoginRoutingModule {}
