import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MenubarService } from './menubar.service';
import { MenuItem } from 'primeng/api';
import { MegaMenuItem } from 'primeng/api'; // required when using MegaMenu

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss'],
})
export class MenubarComponent {
  items: MenuItem[];
  username: string;
  // tslint:disable-next-line: variable-name
  dp_items: any[];
  departments: any[];
  modalityName: any;
  modalityLegend: any;
  categoryName: any;
  categoryLegend: any;

  constructor(
    private primengConfig: PrimeNGConfig,
    private router: Router,
    private menubarService: MenubarService
  ) { }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit(): void {
    this.modalityName = localStorage.modality_name;
    this.modalityLegend = localStorage.modality_legend;
    this.categoryName = localStorage.category_name;
    this.categoryLegend = localStorage.category_legend;



    this.primengConfig.ripple = true;

    this.username = JSON.parse(localStorage.user).first_name;

    // this.listDepartments();

    // this.createMenu();
  }
  // tslint:disable-next-line: typedef
  public createMenu() {
    this.menubarService.getDepartments().subscribe(
      (response) => {
        this.departments = response;
        this.dp_items = this.departments.map((dp) => {
          return { label: dp.name, url: '#department/' + dp.id };
        });
        this.items = [
          {
            label: 'Departamentos',
            icon: 'pi pi-fw pi-bookmark',
            items: this.dp_items,
          },
          {
            label: 'Gerenciar',
            icon: 'pi pi-fw pi-cog',
            items: [
              {
                label: 'Departamentos',
                icon: 'pi pi-fw pi-briefcase',
                url: '#department-crud',
              },
              {
                label: 'Postagens',
                icon: 'pi pi-fw pi-comments',
                url: '#post-crud',
              },
            ],
          },
        ];
      },
      (error) => {
        alert('Houve algum erro ao carregar a lista.');
      }
    );
  }

  // tslint:disable-next-line: typedef
  public sairIAS() {
    localStorage.clear();
    this.router.navigate(['login/']);
  }
}
