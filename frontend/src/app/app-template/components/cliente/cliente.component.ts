import { Component, OnInit } from '@angular/core';
import { ClientService } from './cliente.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})

export class ClienteComponent implements OnInit {
  clientes: any;
  clientDialog: boolean;
  form: FormGroup;
  dataAtual: Date = new Date();

  constructor(private clientService: ClientService, private fb: FormBuilder) {
    this.form = this.fb.group({ NameClient: null, RespClient: null, Cnpj: null, dataCadastro: null, TipoClient: "null" })
  }

  ngOnInit(): void {
    this.getClient()
    this.clientDialog = false
  }

  getClient() {
    this.clientService.getClientes().subscribe(
      data => { console.log(data), this.clientes = data }
    )
  }

  openClientForm() {
    this.clientDialog = true;
  }

  postClient() {

    this.form.value['dataCadastro'] = this.dataAtual
    this.clientService.postClient(this.form.value).subscribe(
      data => {
        console.log(data); this.getClient(); this.clientDialog = false
      }
    )

  }

}
