import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClientService } from './cliente.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Client {
  NameClient?: string;
  RespClient?: string;
  Cnpj?: string;
  dataCadastro?: string | Date | null;
  TipoClient?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent implements OnInit, OnDestroy {
  // keep original public property names to avoid breaking existing templates
  clientes: Client[] = [];
  clientDialog = false;
  form: FormGroup;
  dataAtual = new Date();

  private unsubscribe$ = new Subject<void>();

  constructor(private clientService: ClientService, private fb: FormBuilder) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Build the reactive form. Validators can be added later without changing callers.
  private createForm(): FormGroup {
    return this.fb.group({
      NameClient: [null],
      RespClient: [null],
      Cnpj: [null],
      dataCadastro: [null],
      TipoClient: [null]
    });
  }

  // Load clients from the service with proper unsubscription
  private loadClients(): void {
    // Authorization: allow if no token present (legacy support), otherwise require a readable token.
    if (!this.isAuthorizedToRead()) {
      this.handleError(new Error('Unauthorized to load clients'));
      return;
    }

    this.clientService
      .getClientes()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data: any) => this.handleClientResponse(data),
        error: (error: any) => this.handleError(error)
      });
  }

  private handleClientResponse(data: any): void {
    // keep console.debug to preserve previous logging behavior but make message clearer
    console.debug('Clientes loaded:', data);
    this.clientes = Array.isArray(data) ? data : [];
  }

  // Centralized error handler
  private handleError(error: any): void {
    // Keep the original console.error behavior and provide a clearer message
    console.error('Error in ClienteComponent:', error);
  }

  openClientForm(): void {
    this.clientDialog = true;
  }

  // Post a new client. Enforces authorization policy for write operations.
  postClient(): void {
    if (!this.isAuthorizedToWrite()) {
      this.handleError(new Error('Unauthorized to create a client'));
      return;
    }

    this.form.patchValue({ dataCadastro: this.dataAtual });

    this.clientService
      .postClient(this.form.value)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data: any) => this.handlePostClientResponse(data),
        error: (error: any) => this.handleError(error)
      });
  }

  private handlePostClientResponse(data: any): void {
    console.debug('Client posted successfully:', data);
    // refresh clients list to preserve original behavior
    this.loadClients();
    this.clientDialog = false;
  }

  // ------------------
  // Authentication helpers
  // ------------------

  // Reads an auth token from storage. Projects often use an interceptor to attach this token
  // to HTTP requests. We do not enforce server-side behavior here; this provides client-side
  // checks and will default to permissive behavior when no token exists to preserve legacy behavior.
  private readAuthToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch (e) {
      // Access to localStorage may fail in some environments; be permissive to avoid breaking behavior.
      console.warn('Unable to access localStorage for auth token check.', e);
      return null;
    }
  }

  // Decode roles from a JWT payload if present. If decoding fails, return an empty array.
  // This is a lightweight, client-only role extraction for UI policies only.
  private decodeRolesFromJwt(token: string): string[] {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return [];
      }
      // Base64 decode the payload. Replace URL-safe characters first.
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      // atob may throw if payload is malformed
      const json = decodeURIComponent(
        Array.prototype.map
          .call(atob(payload), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const obj = JSON.parse(json);
      // Support common claim names: roles (array) or role (single entry) or scope (space-separated)
      if (Array.isArray(obj.roles)) {
        return obj.roles;
      }
      if (typeof obj.role === 'string') {
        return [obj.role];
      }
      if (typeof obj.scope === 'string') {
        return obj.scope.split(' ').map((s: string) => s.trim()).filter(Boolean);
      }
      return [];
    } catch (e) {
      // If decoding fails, log and return empty array to avoid breaking existing flows.
      console.warn('Failed to decode JWT roles:', e);
      return [];
    }
  }

  // Client-side read authorization. If no token found, default to permissive (legacy support).
  private isAuthorizedToRead(): boolean {
    const token = this.readAuthToken();
    if (!token) {
      // No token -> keep legacy permissive behavior
      return true;
    }
    // If token exists, we consider the user authorized to read if they have any role.
    const roles = this.decodeRolesFromJwt(token);
    return roles.length > 0;
  }

  // Client-side write authorization. Requires a specific role when a token is present.
  private isAuthorizedToWrite(): boolean {
    const token = this.readAuthToken();
    if (!token) {
      // No token -> keep legacy permissive behavior
      return true;
    }
    const roles = this.decodeRolesFromJwt(token);
    // Accept either an administrative role or a more granular scope.
    const allowed = ['admin', 'client:write', 'client_admin'];
    return roles.some(r => allowed.includes(r));
  }
}
