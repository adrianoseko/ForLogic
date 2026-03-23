import { Component, OnInit, Injectable } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HomeService } from './home.service';
import { MenuItem } from 'primeng/api';

// Simple, local JWT-based AuthService included here to keep the component self-contained.
// In a real app this should be in its own file and thoroughly tested. ProvidedIn root
// so other parts of the app can reuse it.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'app_jwt_token';

  // Store token (in production prefer httpOnly, secure cookies handled by server)
  storeToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (err) {
      // localStorage may be unavailable in some environments
      console.warn('Unable to store token', err);
    }
  }

  clearToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (err) {
      console.warn('Unable to clear token', err);
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (err) {
      console.warn('Unable to read token', err);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Decodes basic JWT payload to extract roles claim if present.
  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) {
      return [];
    }

    try {
      const payload = token.split('.')[1];
      // base64url -> base64
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const obj = JSON.parse(json);
      // Accept 'roles' as array or single string
      const roles = obj?.roles || obj?.role || [];
      return Array.isArray(roles) ? roles : [String(roles)];
    } catch (err) {
      console.warn('Failed to parse JWT roles', err);
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }
}

type ActionOption = { name: string; value: number };

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  // Menu items used by the template — initialized defensively
  items: MenuItem[] = [];

  // The selected action value (null when none chosen)
  selectedAction: number | null = null;

  // transient numeric input bound to select control
  value = 0;

  // All possible actions. Kept private to avoid accidental mutation from templates.
  private readonly PAYMENT_OPTIONS: ActionOption[] = [
    { name: 'Gerenciar Clientes', value: 1 },
    { name: 'Avaliações de Clientes', value: 2 },
    { name: 'Gerenciar Usuários', value: 3 },
    { name: 'NPS', value: 4 }
  ];

  // Options exposed to the UI after role-based filtering (if any)
  availableOptions: ActionOption[] = [];

  constructor(
    private readonly primengConfig: PrimeNGConfig,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly homeService: HomeService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeAvailableOptions();
    this.resetSelectedAction();
  }

  // Called when the numeric selection control changes in the template
  handlePaymentOptionChange(): void {
    const selectedValue = this.value;

    // Validate and map the chosen value to an action that is available to the user
    const mappedAction = this.mapSelectedAction(selectedValue);

    // If user is not authorized for that action, we keep behavior conservative: do not set it.
    if (mappedAction !== null && !this.isActionAuthorized(mappedAction)) {
      // In an app with notifications you'd show a message here. We keep behavior non-intrusive.
      console.warn('User is not authorized to access action', mappedAction);
      this.value = 0; // reset transient control
      return; // leave selectedAction unchanged
    }

    this.selectedAction = mappedAction;
    this.value = 0; // reset transient control to default
  }

  // Return the user to a neutral state
  backHome(): void {
    this.resetSelectedAction();
  }

  // Map a numeric value to the configured option if present
  private mapSelectedAction(value: number): number | null {
    return this.availableOptions.find(option => option.value === value)?.value ?? null;
  }

  // Reset selection to none
  private resetSelectedAction(): void {
    this.selectedAction = null;
  }

  // Initialize availableOptions based on authentication and roles.
  // To preserve existing behavior for unauthenticated users we expose all options if no token is present.
  private initializeAvailableOptions(): void {
    try {
      if (!this.authService || !this.authService.isAuthenticated()) {
        // No auth or not authenticated: preserve original list (backwards compatible)
        this.availableOptions = [...this.PAYMENT_OPTIONS];
        return;
      }

      // Authenticated: enforce role based visibility
      const roles = this.authService.getUserRoles();

      this.availableOptions = this.PAYMENT_OPTIONS.filter(option => {
        // Example policy:
        // - 'Gerenciar Usuários' (value 3) requires 'admin'
        // - 'NPS' (value 4) requires 'manager' or 'admin'
        // - other items visible to any authenticated user
        if (option.value === 3) {
          return roles.includes('admin');
        }
        if (option.value === 4) {
          return roles.includes('manager') || roles.includes('admin');
        }
        return true;
      });
    } catch (err) {
      console.error('Failed to initialize options', err);
      // fallback to showing everything to avoid changing behaviour
      this.availableOptions = [...this.PAYMENT_OPTIONS];
    }
  }

  // Checks whether the current user is authorized to execute a specific action value.
  // If not authenticated, this method defers to permissive default (maintains existing behaviour).
  private isActionAuthorized(actionValue: number): boolean {
    if (!this.authService || !this.authService.isAuthenticated()) {
      // No authentication present: don't restrict (backwards compatibility)
      return true;
    }

    // Enforce the same policy as visibility
    if (actionValue === 3) {
      return this.authService.hasRole('admin');
    }
    if (actionValue === 4) {
      return this.authService.hasRole('manager') || this.authService.hasRole('admin');
    }
    return true;
  }
}
