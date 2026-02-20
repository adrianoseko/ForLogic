import { Component, OnInit } from '@angular/core';
import { NpsService } from './nps.service';

interface Avaliacao {
  nota: number;
  dataAvaliacao: string;
}

@Component({
  selector: 'app-nps',
  templateUrl: './nps.component.html',
  styleUrls: ['./nps.component.scss']
})
export class NpsComponent implements OnInit {
  private avaliacoes: Avaliacao[] = [];
  private promotorCount: number = 0;
  private neutroCount: number = 0;
  private detratorCount: number = 0;
  private npsScore: number = 0;
  private result: string = '';
  private color: string = '';
  public dataInicial: Date | null = null;
  public dataFinal: Date | null = null;
  public filteredData: Avaliacao[] = [];

  constructor(private npsService: NpsService) { }

  ngOnInit(): void {
    this.loadAvaliacoes();
  }

  private loadAvaliacoes(): void {
    this.npsService.getAvaliacao().subscribe(
      data => {
        this.avaliacoes = data;
        this.calculateNps(this.avaliacoes);
      },
      error => {
        console.error('Error fetching evaluations:', error);
      }
    );
  }

  private calculateNps(avaliacoes: Avaliacao[]): void {
    this.resetCounts();
    this.total = avaliacoes.length;

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
    if (avaliacao.nota >= 9) {
      this.promotorCount++;
    } else if (avaliacao.nota >= 7) {
      this.neutroCount++;
    } else {
      this.detratorCount++;
    }
  }

  private calculateNpsScore(): number {
    return ((this.promotorCount - this.detratorCount) / this.total) * 100;
  }

  private determineColor(nps: number): string {
    if (nps >= 80) return 'green';
    if (nps >= 60) return 'yellow';
    return 'red';
  }

  public filterAvaliacoes(): void {
    this.filteredData = this.avaliacoes.filter(avaliacao => this.isWithinDateRange(avaliacao));
    console.log(this.filteredData);
    this.calculateNps(this.filteredData);
  }

  private isWithinDateRange(avaliacao: Avaliacao): boolean {
    const avaliacaoDate = new Date(avaliacao.dataAvaliacao);
    const startOfDay = this.dataInicial ? new Date(this.dataInicial.setHours(0, 0, 0, 0)) : new Date(0);
    const endOfDay = this.dataFinal ? new Date(this.dataFinal.setHours(23, 59, 59, 999)) : new Date();

    return avaliacaoDate >= startOfDay && avaliacaoDate <= endOfDay;
  }
}