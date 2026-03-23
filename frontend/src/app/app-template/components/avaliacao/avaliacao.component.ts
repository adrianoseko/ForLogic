import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AvaliacaoService } from './avaliacao.service';
import { environment } from 'src/environments/environment';

/**
 * Lightweight interfaces to improve readability and type safety in this component.
 * Keep these limited to the properties this component relies on so behavior is unchanged.
 */
interface Avaliacao {
  id?: number;
  client: number;
  nota: number | null;
  motivo?: string | null;
  dataAvaliacao: string | Date | null;
  [key: string]: any; // preserve ability to accept additional fields returned from backend
}

interface Cliente {
  id: number;
  nome?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-avaliacao',
  templateUrl: './avaliacao.component.html',
  styleUrls: ['./avaliacao.component.scss']
})
export class AvaliacaoComponent implements OnInit {
  // Domain data
  avaliacoes: Avaliacao[] = [];
  clientes: Cliente[] = [];

  // UI state
  avaliacaoDialog = false;
  dataAtual: Date = new Date();

  // Reactive form
  form: FormGroup;

  // CORS configuration exposure (read-only). This does not change app behavior but
  // documents allowed origins depending on environment. Actual CORS enforcement
  // must be configured on the server. See developer notes.
  readonly allowedOrigins: string[] = environment.production
    ? ['https://your.production.domain'] // replace with your real production origin(s)
    : ['http://localhost:4200'];

  constructor(
    private avaliacaoService: AvaliacaoService,
    private fb: FormBuilder
  ) {
    // Keep the same form shape to preserve behavior
    this.form = this.fb.group({
      client: null,
      nota: null,
      motivo: null,
      dataAvaliacao: null
    });
  }

  ngOnInit(): void {
    this.loadAvaliacoes();
  }

  /** Load evaluations from the backend. Behavior unchanged: uses service observable and subscribes. */
  private loadAvaliacoes(): void {
    try {
      this.avaliacaoService.getAvaliacao().subscribe(
        (data: any) => this.handleAvaliacoesResponse(data),
        (error: any) => this.handleError(error)
      );
    } catch (err) {
      // Defensive error capture in case service throws synchronously
      this.handleError(err);
    }
  }

  private handleAvaliacoesResponse(data: any): void {
    // Preserve original console logging for parity with previous behavior
    console.log(data);
    // Cast to typed array while preserving any extra fields
    this.avaliacoes = Array.isArray(data) ? (data as Avaliacao[]) : [];
  }

  /** Open the evaluation dialog and load clients as before. */
  openAvaliacao(): void {
    this.avaliacaoDialog = true;
    this.loadClientes();
  }

  private loadClientes(): void {
    try {
      this.avaliacaoService.getClientes().subscribe(
        (data: any) => this.handleClientesResponse(data),
        (error: any) => this.handleError(error)
      );
    } catch (err) {
      this.handleError(err);
    }
  }

  private handleClientesResponse(data: any): void {
    console.log(data);
    this.clientes = Array.isArray(data) ? (data as Cliente[]) : [];
  }

  /** Prepare and post a new evaluation. Behavior preserved. */
  postAvaliacao(): void {
    this.prepareFormData();

    try {
      this.avaliacaoService.postAvaliacao(this.form.value).subscribe(
        (data: any) => this.handlePostAvaliacaoResponse(data),
        (error: any) => this.handleError(error)
      );
    } catch (err) {
      this.handleError(err);
    }
  }

  /** Ensure the form payload is shaped the same way as before. */
  private prepareFormData(): void {
    const clientValue = this.form.value.client;

    // Preserve previous behavior: replace client object with its id and set evaluation date
    this.form.patchValue({
      client: clientValue && typeof clientValue === 'object' ? clientValue.id : clientValue,
      dataAvaliacao: this.dataAtual
    });
  }

  private handlePostAvaliacaoResponse(data: any): void {
    console.log(data);
    // refresh list and close dialog as previously
    this.loadAvaliacoes();
    this.avaliacaoDialog = false;
  }

  /** Centralized error handling. Keep console output but make it clear for future extension. */
  private handleError(error: any): void {
    console.error('An error occurred:', error);
    // Future: integrate a user-visible notification service here (snackbar/toast)
  }

  // -------------------------
  // Optional JWT helpers (non-blocking)
  // -------------------------
  // These helpers read a JWT token (if present in localStorage or cookies), decode
  // it, and expose utility methods to check authentication and roles. They do NOT
  // prevent any existing behavior — they are opt-in checks that templates or
  // calling code may use. Actual enforcement on controller endpoints must be
  // performed on the server; frontend role checks are only a UI convenience.

  private getTokenFromLocalStorage(): string | null {
    return localStorage.getItem('jwt_token');
  }

  private getTokenFromCookie(name = 'jwt_token'): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  private getJwtToken(): string | null {
    return this.getTokenFromLocalStorage() || this.getTokenFromCookie();
  }

  private safeParseJwt(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      // Add padding for base64 if required
      const fixed = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = fixed.length % 4 === 0 ? '' : '='.repeat(4 - (fixed.length % 4));
      const decoded = atob(fixed + pad);
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }

  /** Returns true if a JWT token exists and appears valid. Non-blocking: used only by UI. */
  isAuthenticated(): boolean {
    const token = this.getJwtToken();
    if (!token) return false;
    return this.safeParseJwt(token) !== null;
  }

  /** Check if the current user token contains a role. Non-blocking; frontend-only. */
  userHasRole(expectedRole: string): boolean {
    const token = this.getJwtToken();
    if (!token) return false;
    const payload = this.safeParseJwt(token);
    if (!payload) return false;

    // Common claim names: 'role', 'roles', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    const roleClaim = payload.role || payload.roles || payload.Roles || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (!roleClaim) return false;

    if (Array.isArray(roleClaim)) {
      return roleClaim.includes(expectedRole);
    }

    if (typeof roleClaim === 'string') {
      return roleClaim === expectedRole || roleClaim.split(',').map(r => r.trim()).includes(expectedRole);
    }

    return false;
  }
}
