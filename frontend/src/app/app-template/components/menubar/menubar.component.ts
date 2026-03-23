import { Component, OnInit, Optional } from '@angular/core';
import { PrimeNGConfig, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MenubarService } from './menubar.service';

interface Department {
  id: number;
  name: string;
  [key: string]: any;
}

interface User {
  first_name?: string;
  roles?: string[];
  [key: string]: any;
}

/**
 * MenubarComponent
 * - Refactored for readability and maintainability
 * - Preserves original behavior
 * - Supports optional AuthService injection (JWT/cookie handling, role checks)
 *   If no AuthService is provided, the component falls back to localStorage usage
 *
 * Note: Server-side concerns such as CORS and role-based authorization on controllers
 * belong to the backend. The component uses an optional AuthService to support
 * client-side token handling and simple role checks for UI decisions.
 */
@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss'],
})
export class MenubarComponent implements OnInit {
  public items: MenuItem[] = [];
  public username = '';
  public departmentItems: MenuItem[] = [];
  public departments: Department[] = [];

  // persisted UI state read from localStorage
  public modalityName = '';
  public modalityLegend = '';
  public categoryName = '';
  public categoryLegend = '';

  constructor(
    private primengConfig: PrimeNGConfig,
    private router: Router,
    private menubarService: MenubarService,
    @Optional() private authService?: any // optional to avoid breaking apps without a provided AuthService
  ) {}

  public ngOnInit(): void {
    // enable ripple effect for PrimeNG
    this.primengConfig.ripple = true;

    this.initializeUserData();
    this.loadDepartments();
  }

  /** Initialize user-related data. Prefer AuthService if available. */
  private initializeUserData(): void {
    try {
      const userFromAuth = this.getUserFromAuthService();
      if (userFromAuth) {
        this.username = userFromAuth.first_name || '';
      } else {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed: User = JSON.parse(raw);
          this.username = parsed.first_name || '';
        }
      }
    } catch (e) {
      // Preserve original behavior but provide safer error handling
      console.error('Failed to initialize user data:', e);
    }

    this.loadLocalStorageData();
  }

  private getUserFromAuthService(): User | null {
    try {
      if (this.authService && typeof this.authService.getUser === 'function') {
        return this.authService.getUser() as User;
      }
    } catch (e) {
      console.warn('AuthService.getUser() threw an error, falling back to localStorage', e);
    }
    return null;
  }

  private loadLocalStorageData(): void {
    this.modalityName = localStorage.getItem('modality_name') || '';
    this.modalityLegend = localStorage.getItem('modality_legend') || '';
    this.categoryName = localStorage.getItem('category_name') || '';
    this.categoryLegend = localStorage.getItem('category_legend') || '';
  }

  private loadDepartments(): void {
    this.menubarService.getDepartments().subscribe({
      next: (response: Department[]) => this.handleDepartmentsResponse(response),
      error: (error: HttpErrorResponse | any) => this.handleError(error),
    });
  }

  private handleDepartmentsResponse(response: Department[]): void {
    this.departments = Array.isArray(response) ? response : [];

    this.departmentItems = this.departments.map((dp: Department) => ({
      label: dp.name,
      url: `#department/${dp.id}`,
    }));

    this.buildMenuItems();
  }

  private buildMenuItems(): void {
    // The menu items and structure are preserved to keep behavior unchanged
    this.items = [
      {
        label: 'Departamentos',
        icon: 'pi pi-fw pi-bookmark',
        items: this.departmentItems,
      },
      {
        label: 'Gerenciar',
        icon: 'pi pi-fw pi-cog',
        items: [
          {
            label: 'Departamentos',
            icon: 'pi pi-fw pi-briefcase',
            url: '#department-crud',
          },
          {
            label: 'Postagens',
            icon: 'pi pi-fw pi-comments',
            url: '#post-crud',
          },
        ],
      },
    ];
  }

  private handleError(error: HttpErrorResponse | any): void {
    // Keep original visible behavior (alert) but provide better logging
    console.error('Error loading departments:', error);

    // Provide user-friendly message -- same effect as original alert
    try {
      alert('Houve algum erro ao carregar a lista.');
    } catch (e) {
      // In case alert is not available, swallow gracefully but log
      console.warn('Unable to show alert to the user.', e);
    }
  }

  /**
   * Trigger logout. Prefer AuthService.logout() if available so JWT/cookies
   * are properly cleared. Fall back to clearing localStorage and navigate to login.
   */
  public logout(): void {
    try {
      if (this.authService && typeof this.authService.logout === 'function') {
        // AuthService.logout is expected to handle token revocation/cleanup and navigation
        this.authService.logout();
        return;
      }
    } catch (e) {
      console.warn('AuthService.logout() failed, falling back to local clear:', e);
    }

    // Preserve original behavior
    localStorage.clear();
    this.router.navigate(['login/']);
  }

  /**
   * Utility to check roles on the client-side (if AuthService provides it).
   * This method does not change behavior by itself; it allows other templates
   * and code to implement role-based UI decisions.
   */
  public hasRole(role: string): boolean {
    try {
      if (this.authService && typeof this.authService.hasRole === 'function') {
        return Boolean(this.authService.hasRole(role));
      }

      // Fallback: inspect 'user' entry in localStorage for roles[]
      const raw = localStorage.getItem('user');
      if (!raw) {
        return false;
      }
      const parsed: User = JSON.parse(raw);
      const roles = parsed.roles || [];
      return roles.includes(role);
    } catch (e) {
      console.warn('hasRole check failed, returning false', e);
      return false;
    }
  }
}
