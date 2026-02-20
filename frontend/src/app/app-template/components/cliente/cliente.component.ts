import { Component, OnInit } from '@angular/core';
import { ClientService } from './cliente.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})

export class ClienteComponent implements OnInit {
  clientes: any[] = [];
  clientDialog: boolean = false;
  form: FormGroup;
  dataAtual: Date = new Date();

  constructor(private clientService: ClientService, private fb: FormBuilder) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.loadClients();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      NameClient: null,
      RespClient: null,
      Cnpj: null,
      dataCadastro: null,
      TipoClient: null
    });
  }

  private loadClients(): void {
    this.clientService.getClientes().subscribe(
      (data) => this.handleClientResponse(data),
      (error) => this.handleError(error)
    );
  }

  private handleClientResponse(data: any): void {
    console.log(data);
    this.clientes = data;
  }

  private handleError(error: any): void {
    console.error('Error fetching clients:', error);
  }

  openClientForm(): void {
    this.clientDialog = true;
  }

  postClient(): void {
    this.form.patchValue({ dataCadastro: this.dataAtual });
    this.clientService.postClient(this.form.value).subscribe(
      (data) => this.handlePostClientResponse(data),
      (error) => this.handleError(error)
    );
  }

  private handlePostClientResponse(data: any): void {
    console.log(data);
    this.loadClients();
    this.clientDialog = false;
  }
}