import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HomeService } from './home.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  items: MenuItem[];
  selectedAction: number | null = null;
  value: number = 0;

  private readonly paymentOptions: Array<{ name: string; value: number }> = [
    { name: 'Gerenciar Clientes', value: 1 },
    { name: 'Avaliações de Clientes', value: 2 },
    { name: 'Gerenciar Usuários', value: 3 },
    { name: 'NPS', value: 4 },
  ];

  constructor(
    private primengConfig: PrimeNGConfig,
    private router: Router,
    private fb: FormBuilder,
    private homeService: HomeService
  ) {}

  ngOnInit(): void {
    this.resetSelectedAction();
  }

  onPaymentOptionChange(): void {
    const selectedValue = this.value;
    this.selectedAction = this.getSelectedAction(selectedValue);
    this.value = 0;
  }

  backHome(): void {
    this.resetSelectedAction();
  }

  private getSelectedAction(value: number): number | null {
    return this.paymentOptions.find(option => option.value === value)?.value || null;
  }

  private resetSelectedAction(): void {
    this.selectedAction = null;
  }
}