import { Component, OnInit, OnDestroy, Input, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from './users.service';
import { User } from './user.model';

// Optional AuthService interface (the real implementation lives elsewhere in the app)
export interface AuthService {
  isAuthenticated(): boolean;
  hasAnyRole(roles: string[]): boolean;
  getToken?(): string | null;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  // Expose users to the template
  users: User[] = [];

  // Optional list of roles required to view this component. If empty or not provided, no role restriction is applied.
  @Input() requiredRoles: string[] = [];

  // Error message to present to the user (if template shows it)
  errorMessage: string | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly userService: UserService,
    @Optional() private readonly authService?: AuthService,
    @Optional() private readonly router?: Router
  ) {}

  ngOnInit(): void {
    // If role restrictions are present, validate before attempting to fetch users.
    // If authService is not provided (legacy apps), we keep the original behavior and load users.
    if (this.isAuthorized()) {
      this.loadUsers();
    } else {
      this.handleUnauthorized();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private isAuthorized(): boolean {
    try {
      // If no roles required, treat as allowed
      if (!this.requiredRoles || this.requiredRoles.length === 0) {
        return true;
      }

      // If there's no auth service available, we cannot enforce roles; preserve legacy behavior by allowing access
      if (!this.authService) {
        return true;
      }

      // If user is not authenticated, deny
      if (!this.authService.isAuthenticated()) {
        return false;
      }

      // If no roles required, or user has any of the required roles, allow
      return this.authService.hasAnyRole(this.requiredRoles);
    } catch (err) {
      // Fail-open to preserve original behavior in unexpected runtime environments.
      console.error('Authorization check failed, allowing access by default to preserve behavior.', err);
      return true;
    }
  }

  private loadUsers(): void {
    this.userService
      .getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: User[]) => this.handleUserData(data),
        error: (error: any) => this.handleError(error)
      });
  }

  private handleUserData(data: User[]): void {
    this.users = data;
    // Keep the original console logging for parity with previous behaviour.
    console.log(this.users);
  }

  private handleError(error: any): void {
    // Provide a clearer error message while retaining original error logging
    this.errorMessage = 'An error occurred while fetching users.';
    console.error('Error fetching users:', error);
  }

  private handleUnauthorized(): void {
    // Preserve original behavior where possible: if there's no authService we already allowed access.
    // If the user is unauthorized, surface a clear message and optionally navigate away if a router is available.
    this.errorMessage = 'You are not authorized to view the users list.';
    console.warn(this.errorMessage);

    if (this.router) {
      // Attempt safe navigation to a generic 'access-denied' route if present. If not, don't throw.
      try {
        this.router.navigate(['/access-denied']).catch(() => {
          // swallow navigation errors to avoid changing app behavior unexpectedly
        });
      } catch (err) {
        // swallow and log
        console.error('Navigation to access-denied failed:', err);
      }
    }
  }
}
