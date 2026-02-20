import { Component, OnInit } from '@angular/core';
import { AvaliacaoService } from './avaliacao.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-avaliacao',
  templateUrl: './avaliacao.component.html',
  styleUrls: ['./avaliacao.component.scss']
})
export class AvaliacaoComponent implements OnInit {
  avaliacoes: any[] = [];
  avaliacaoDialog: boolean = false;
  clientes: any[] = [];
  form: FormGroup;
  dataAtual: Date = new Date();

  constructor(private avaliacaoService: AvaliacaoService, private fb: FormBuilder) {
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

  private loadAvaliacoes(): void {
    this.avaliacaoService.getAvaliacao().subscribe(
      (data) => this.handleAvaliacoesResponse(data),
      (error) => this.handleError(error)
    );
  }

  private handleAvaliacoesResponse(data: any): void {
    console.log(data);
    this.avaliacoes = data;
  }

  openAvaliacao(): void {
    this.avaliacaoDialog = true;
    this.loadClientes();
  }

  private loadClientes(): void {
    this.avaliacaoService.getClientes().subscribe(
      (data) => this.handleClientesResponse(data),
      (error) => this.handleError(error)
    );
  }

  private handleClientesResponse(data: any): void {
    console.log(data);
    this.clientes = data;
  }

  postAvaliacao(): void {
    this.prepareFormData();
    this.avaliacaoService.postAvaliacao(this.form.value).subscribe(
      (data) => this.handlePostAvaliacaoResponse(data),
      (error) => this.handleError(error)
    );
  }

  private prepareFormData(): void {
    this.form.patchValue({
      client: this.form.value.client.id,
      dataAvaliacao: this.dataAtual
    });
  }

  private handlePostAvaliacaoResponse(data: any): void {
    console.log(data);
    this.loadAvaliacoes();
    this.avaliacaoDialog = false;
  }

  private handleError(error: any): void {
    console.error('An error occurred:', error);
    // Additional error handling can be implemented here
  }
}