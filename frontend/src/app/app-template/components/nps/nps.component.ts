import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NpsService } from './nps.service';

/**
 * Minimal shape of an evaluation returned by the service.
 */
interface Avaliacao {
  nota: number;
  dataAvaliacao: string;
}

/**
 * Optional authentication/authorization provider interface.
 * The provider can be implemented elsewhere in the app and provided via DI.
 * This component will operate exactly as before when no provider is present.
 */
export interface AuthProvider {
  isAuthenticated(): boolean;
  hasRole(role: string): boolean;
}

@Component({
  selector: 'app-nps',
  templateUrl: './nps.component.html',
  styleUrls: ['./nps.component.scss']
})
export class NpsComponent implements OnInit, OnDestroy {
  // Internal storage of evaluations fetched from the server
  private avaliacoes: Avaliacao[] = [];

  // Counters for NPS calculation
  private promotorCount = 0;
  private neutroCount = 0;
  private detratorCount = 0;

  // Exposed values for the template
  public npsScore = 0;
  public result = '';
  public color = '';
  public dataInicial: Date | null = null;
  public dataFinal: Date | null = null;
  public filteredData: Avaliacao[] = [];

  // Total number of evaluations included in the calculation
  public total = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private npsService: NpsService,
    @Optional() private authProvider?: AuthProvider
  ) {}

  ngOnInit(): void {
    try {
      if (this.authProvider) {
        // If an auth provider is present, enforce authentication & a role.
        // We keep behavior identical when no provider is registered (legacy apps).
        if (!this.authProvider.isAuthenticated()) {
          console.warn('User is not authenticated. NPS data will not be fetched.');
          return;
        }

        // Role-based guard for accessing NPS data. Component requires 'NpsViewer' role.
        if (!this.authProvider.hasRole('NpsViewer')) {
          console.warn('User does not have the required role to view NPS data.');
          return;
        }
      }

      // Load evaluations (same primary behavior as original)
      this.loadAvaliacoes();
    } catch (err) {
      // Defensive logging; do not alter control flow
      console.error('Initialization error in NpsComponent:', err);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAvaliacoes(): void {
    this.npsService
      .getAvaliacao()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data: Avaliacao[]) => {
          this.avaliacoes = Array.isArray(data) ? data : [];
          this.calculateNps(this.avaliacoes);
        },
        (error: unknown) => {
          console.error('Error fetching evaluations:', error);
        }
      );
  }

  private calculateNps(avaliacoes: Avaliacao[]): void {
    this.resetCounts();

    this.total = avaliacoes ? avaliacoes.length : 0;

    if (this.total === 0) {
      // Preserve stable values and avoid divide-by-zero
      this.npsScore = 0;
      this.color = this.determineColor(this.npsScore);
      this.result = this.npsScore.toFixed(2);
      return;
    }

    for (const avaliacao of avaliacoes) {
      this.categorizeAvaliacao(avaliacao);
    }

    this.npsScore = this.calculateNpsScore();
    this.color = this.determineColor(this.npsScore);
    this.result = this.npsScore.toFixed(2);
    console.log(this.result);
  }

  private resetCounts(): void {
    this.promotorCount = 0;
    this.neutroCount = 0;
    this.detratorCount = 0;
  }

  private categorizeAvaliacao(avaliacao: Avaliacao): void {
    if (!avaliacao || typeof avaliacao.nota !== 'number') return;

    if (avaliacao.nota >= 9) {
      this.promotorCount++;
    } else if (avaliacao.nota >= 7) {
      this.neutroCount++;
    } else {
      this.detratorCount++;
    }
  }

  private calculateNpsScore(): number {
    // total is guarded to be non-zero prior to calling this in practice
    if (this.total === 0) return 0;
    return ((this.promotorCount - this.detratorCount) / this.total) * 100;
  }

  private determineColor(nps: number): string {
    if (nps >= 80) return 'green';
    if (nps >= 60) return 'yellow';
    return 'red';
  }

  public filterAvaliacoes(): void {
    // Keep external behavior: filter using the date range and recalculate
    this.filteredData = this.avaliacoes.filter((avaliacao) => this.isWithinDateRange(avaliacao));
    console.log(this.filteredData);
    this.calculateNps(this.filteredData);
  }

  private isWithinDateRange(avaliacao: Avaliacao): boolean {
    if (!avaliacao || !avaliacao.dataAvaliacao) return false;

    const avaliacaoDate = new Date(avaliacao.dataAvaliacao);

    // Do not mutate the component's date objects; create copies to normalize boundaries
    const startOfDay = this.dataInicial
      ? new Date(new Date(this.dataInicial.getTime()).setHours(0, 0, 0, 0))
      : new Date(0);

    const endOfDay = this.dataFinal
      ? new Date(new Date(this.dataFinal.getTime()).setHours(23, 59, 59, 999))
      : new Date();

    return avaliacaoDate >= startOfDay && avaliacaoDate <= endOfDay;
  }
}
