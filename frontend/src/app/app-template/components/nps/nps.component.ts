import { Component, OnInit } from '@angular/core';
import { NpsService } from './nps.service'

@Component({
  selector: 'app-nps',
  templateUrl: './nps.component.html',
  styleUrls: ['./nps.component.scss']
})
export class NpsComponent implements OnInit {
  avaliacoes: any;
  promotor: any;
  neutro: any;
  detrator: any
  color: any;
  nps: any;
  total: any;
  result: any;
  dataInicial: any;
  dataFinal: any;
  dataFiltro: any[] = [];
  constructor(private npsService: NpsService) { }

  ngOnInit(): void {

    this.getAvaliacao()
  }

  getAvaliacao() {
    this.npsService.getAvaliacao().subscribe(
      data => { console.log(data), this.avaliacoes = data; this.npsCalc(this.avaliacoes) }
    )
  }

  npsCalc(avaliacoes) {
    this.promotor = 0
    this.neutro = 0
    this.detrator = 0
    this.nps = 0
    this.result = 0
    this.total = avaliacoes.length
    for (let n in avaliacoes) {
      var nota = avaliacoes[n].nota;
      if (nota >= 9) {
        this.promotor += 1
      } else if (nota >= 7 && nota <= 8) {
        this.neutro += 1
      } else {
        this.detrator += 1
      }


    } this.nps = (this.promotor - this.detrator) / avaliacoes.length * 100
    if (this.nps >= 80) {
      this.color = 'green'
    } else if (this.nps << 80 && this.nps >= 60) {
      this.color = 'yellow';
    } else {
      this.color = 'red';
    }
    this.result = this.nps.toFixed(2); console.log(this.result)
  }


  filtro() {
    this.dataFiltro = []; // Clear the previous filter results
    const startOfDay = new Date(this.dataInicial);
    startOfDay.setHours(0, 0, 0, 0); // Set time to start of the day
    const endOfDay = new Date(this.dataFinal);
    endOfDay.setHours(23, 59, 59, 999); // Set time to end of the day

    for (let n in this.avaliacoes) {
      const avaliacaoDate = new Date(this.avaliacoes[n].dataAvaliacao); // Assuming there's a 'data' property in your evaluation object
      console.log(avaliacaoDate)
      if (
        avaliacaoDate >= startOfDay &&
        avaliacaoDate <= endOfDay
      ) {
        console.log('aqui');
        this.dataFiltro.push(this.avaliacoes[n]);
      } else {
        console.log('ERRO');
      }
    }
    console.log(this.dataFiltro);
    this.npsCalc(this.dataFiltro);
  }

}


