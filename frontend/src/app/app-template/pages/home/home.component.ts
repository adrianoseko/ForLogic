import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Home } from './home';
import { HomeService } from './home.service';
import { MenuItem } from 'primeng/api';
import { MegaMenuItem } from 'primeng/api'; //required when using MegaMenu

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  items: MenuItem[];

  selectedAction: any;
  value!: number;

  constructor(
    private primengConfig: PrimeNGConfig,
    private router: Router,
    private fb: FormBuilder,
    private homeService: HomeService
  ) { }



  paymentOptions: any[] = [
    { name: 'Gerenciar Clientes', value: 1 },
    { name: 'Avaliações de Clientes', value: 2 },
    { name: 'Gerenciar Usuários', value: 3 },
    { name: 'NPS', value: 4 },
  ];

  ngOnInit(): void {
    this.selectedAction = null;

  }

  onPaymentOptionChange() {
    console.log(this.value);
    if (this.value[0] == 1) {
      this.selectedAction = 1
    } else if (this.value[0] == 2) {
      this.selectedAction = 2
    } else if (this.value[0] == 3) {
      this.selectedAction = 3
    } else if (this.value[0] == 4) {
      this.selectedAction = 4
    }
    this.value = 0
  }

  backHome() {
    this.selectedAction = 0
  }

}
