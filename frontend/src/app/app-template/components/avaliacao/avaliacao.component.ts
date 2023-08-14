import { Component, OnInit } from '@angular/core';
import { AvaliacaoService } from './avaliacao.service';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-avaliacao',
  templateUrl: './avaliacao.component.html',
  styleUrls: ['./avaliacao.component.scss']
})
export class AvaliacaoComponent implements OnInit {
  avaliacoes: any;
  avaliacaoDialog: boolean;
  clientes: any;
  form: FormGroup;
  dataAtual: Date = new Date();

  constructor(private avaliacaoService: AvaliacaoService, private fb: FormBuilder) {
    this.form = this.fb.group({ client: null, nota: null, motivo: null, dataAvaliacao: null })
  }

  ngOnInit(): void {
    this.getAvaliacao()
    this.avaliacaoDialog = false
  }

  getAvaliacao() {
    this.avaliacaoService.getAvaliacao().subscribe(
      data => { console.log(data), this.avaliacoes = data }
    )
  }

  openAvaliacao() {
    this.avaliacaoDialog = true
    this.getCliente()
  }

  getCliente() {
    this.avaliacaoService.getClientes().subscribe(
      data => { console.log(data), this.clientes = data }
    )
  }

  postAvaliacao() {
    this.form.value['client'] = this.form.value['client'].id
    this.form.value['dataAvaliacao'] = this.dataAtual
    this.avaliacaoService.postAvaliacao(this.form.value).subscribe(
      data => {
        console.log(data); this.getAvaliacao(); this.avaliacaoDialog = false
      }
    )

  }

}
