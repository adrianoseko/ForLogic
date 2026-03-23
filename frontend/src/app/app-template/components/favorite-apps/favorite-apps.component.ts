import { Component, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { FavoriteAppsService } from './favorite-apps.service';
import { App } from './app.model';
import { Observable, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

// Lightweight interfaces so this component can optionally integrate with
// an authentication/notification implementation provided elsewhere in the app.
// These are marked as optional in the constructor so the component preserves
// backward-compatible behavior when the app has not yet wired up auth.
interface IAuthService {
  isAuthenticated(): boolean;
  hasRole(role: Role | string): boolean;
  // Exposes token retrieval so that HTTP interceptors / services can use it.
  getToken(): string | null;
}

interface INotificationService {
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Component({
  selector: 'app-favorite-apps',
  templateUrl: './favorite-apps.component.html',
  styleUrls: ['./favorite-apps.component.scss'],
})
export class FavoriteAppsComponent implements OnInit {
  // Public so the template can bind to it. Use explicit typing.
  public indexList: App[] = [];

  private static readonly DEFAULT_ERROR_MESSAGE = 'Houve algum erro ao carregar a lista.';

  constructor(
    private readonly router: Router,
    private readonly favoriteAppsService: FavoriteAppsService,
    // Optional injection: if your app provides an auth service, it will be used.
    @Optional() private readonly authService?: IAuthService,
    @Optional() private readonly notifier?: INotificationService
  ) {}

  public ngOnInit(): void {
    this.loadFavoriteApps();
  }

  // Keep behavior identical while improving resiliency and clarity.
  private loadFavoriteApps(): void {
    this.favoriteAppsService
      .getApps()
      .pipe(
        take(1),
        catchError((err) => {
          this.handleError(FavoriteAppsComponent.DEFAULT_ERROR_MESSAGE, err);
          // Preserve original behavior: return an empty list so UI remains functional.
          return of<App[]>([]);
        })
      )
      .subscribe((apps: App[]) => (this.indexList = apps));
  }

  // Navigation helper that preserves prior behavior (navigate to root then to uri).
  public redirectTo(uri: string): void {
    // no changes to behavior — still performs the two-step navigation used previously.
    this.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate([uri]))
      .catch((err) => this.handleError('Navigation failed.', err));
  }

  // In original behavior addHit always invoked; we keep that but add optional
  // non-blocking role-aware logging so apps that integrate auth can be informed.
  public addHit(app: App): void {
    try {
      // If an auth service is present, log authorization state. Do not block the call
      // to keep behavior identical for apps that don't wire auth yet.
      if (this.authService && !this.authService.isAuthenticated()) {
        this.notifier?.warn('User not authenticated. Request will still be sent.');
      } else if (this.authService && !this.authService.hasRole(Role.USER)) {
        this.notifier?.warn('User does not have USER role. Request will still be sent.');
      }

      this.favoriteAppsService
        .addHit(app)
        .pipe(
          take(1),
          catchError((err) => {
            this.handleError(FavoriteAppsComponent.DEFAULT_ERROR_MESSAGE, err);
            // Keep behavior: do not rethrow; return empty observable to complete the flow.
            return of(undefined);
          })
        )
        .subscribe(() => {
          // Refresh list and redirect as before.
          this.loadFavoriteApps();
          this.handleAppRedirect(app);
        });
    } catch (err) {
      // Synchronous errors (very unlikely) are handled here.
      this.handleError(FavoriteAppsComponent.DEFAULT_ERROR_MESSAGE, err);
    }
  }

  // Preserve behavior: if URL contains '#', remove it then navigate in-app; otherwise open new window.
  private handleAppRedirect(app: App): void {
    if (!app || !app.url) {
      this.notifier?.warn('App URL is missing.');
      return;
    }

    const cleanedUrl = app.url.includes('#') ? app.url.replace('#', '') : app.url;

    if (app.url.includes('#')) {
      this.redirectTo(cleanedUrl);
    } else {
      // We still open in a new window for external links to mimic existing behavior.
      window.open(cleanedUrl);
    }
  }

  // Centralized error handling so we can later replace alert with a richer UI notification.
  private handleError(userMessage: string, err?: unknown): void {
    // Keep the original alert to preserve exact visible behavior. Also log to console
    // and use optional notification service if available.
    try {
      // Developer-friendly logging
      // eslint-disable-next-line no-console
      console.error(userMessage, err);

      // The original component used alert(...) for errors. To preserve the same
      // user-visible behavior we still call alert. Apps can provide a notifier to
      // replace this behavior by supplying INotificationService in DI.
      alert(userMessage);

      // If a notification service is provided, surface the message there as well.
      this.notifier?.error(userMessage);
    } catch (e) {
      // Swallow any errors thrown while handling errors to avoid breaking the app.
      // eslint-disable-next-line no-console
      console.error('Failed to display error to user', e);
    }
  }
}
