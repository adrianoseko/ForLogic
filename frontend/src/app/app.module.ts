import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Injectable } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { FullCalendarModule } from '@fullcalendar/angular';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { LoginModule } from './app-template/pages/login/login.module';
import { LoginRoutingModule } from './app-template/pages/login/login.routing.module';
import { HomeRoutingModule } from './app-template/pages/home/home.routing.module';

import { LoginComponent } from './app-template/pages/login/login.component';
import { HomeComponent } from './app-template/pages/home/home.component';
import { SideMenuComponent } from './app-template/components/side-menu/side-menu.component';
import { MenubarComponent } from './app-template/components/menubar/menubar.component';
import { FavoriteAppsComponent } from './app-template/components/favorite-apps/favorite-apps.component';
import { ClienteComponent } from './app-template/components/cliente/cliente.component';
import { UsersComponent } from './app-template/components/users/users.component';
import { AvaliacaoComponent } from './app-template/components/avaliacao/avaliacao.component';
import { NpsComponent } from './app-template/components/nps/nps.component';

import { PrimeNgModules } from './prime-ng.modules';

// Register FullCalendar plugins
FullCalendarModule.registerPlugins([
  dayGridPlugin,
  timeGridPlugin,
  interactionPlugin,
]);

// NOTE: CORS is a backend concern. For clarity and security we reference environment-driven allowed origins here
// but actual enforcement must be done on the server. Replace placeholders in production build configuration.
// Example usage (backend): if (environment.production) allowOnly(['https://your-production-domain.com'])
// Development allows localhost for convenience. Do NOT use AllowAll in production.
import { environment } from '../environments/environment';
export const ALLOWED_ORIGINS: string[] = environment.production
  ? ['https://your-production-domain.com']
  : ['http://localhost:4200'];

// Authentication / Authorization helpers
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Simple token store. In production prefer HttpOnly secure cookies set by server.
  private readonly TOKEN_KEY = 'app_token';
  private currentUserRoles$ = new BehaviorSubject<string[]>([]);

  constructor(private http: HttpClient, private router: Router) {}

  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (e) {
      // LocalStorage may be unavailable in some environments — fail gracefully
      return null;
    }
  }

  setToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
      } else {
        localStorage.removeItem(this.TOKEN_KEY);
      }
    } catch (e) {
      // ignore storage errors
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(requiredRoles: string[] = []): boolean {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const roles = this.currentUserRoles$.value || [];
    return requiredRoles.some(r => roles.includes(r));
  }

  // Example login method that expects a { token, roles } response. Integrate with your backend API.
  login(credentials: { username: string; password: string }): Observable<boolean> {
    return this.http.post<{ token: string; roles?: string[] }>('/api/auth/login', credentials).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token);
          this.currentUserRoles$.next(response.roles || []);
        }
      }),
      tap(() => true),
      catchError(err => {
        // bubble up the error for components to handle
        return throwError(err);
      })
    );
  }

  logout(redirectTo = '/login'): void {
    this.setToken(null);
    this.currentUserRoles$.next([]);
    this.router.navigate([redirectTo]);
  }
}

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    let authReq = req;
    if (token) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Optionally handle auth errors (401/403) here; keep behavior unchanged otherwise
        if (error.status === 401 || error.status === 403) {
          // Token might be invalid/expired. Let the app decide; default action: logout.
          this.auth.logout('/login');
        }
        return throwError(error);
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
    if (this.auth.isAuthenticated()) {
      return true;
    }
    // Not authenticated: redirect to login with returnUrl
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
    const requiredRoles = (route.data && route.data.roles) || [];
    if (this.auth.isAuthenticated() && this.auth.hasRole(requiredRoles)) {
      return true;
    }
    // Unauthorized: optionally redirect to an access denied page or login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SideMenuComponent,
    MenubarComponent,
    FavoriteAppsComponent,
    ClienteComponent,
    UsersComponent,
    AvaliacaoComponent,
    NpsComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    LoginModule,
    LoginRoutingModule,
    HomeRoutingModule,
    PrimeNgModules,
    AppRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    // Register the interceptor so it automatically attaches JWT to outgoing requests
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    // Guards and AuthService are providedIn:'root' but listing them here is harmless and explicit
    AuthService,
    AuthGuard,
    RoleGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
