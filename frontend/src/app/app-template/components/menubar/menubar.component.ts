import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Router } from '@angular/router';
import { MenubarService } from './menubar.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss'],
})
export class MenubarComponent implements OnInit {
  items: MenuItem[] = [];
  username: string = '';
  departmentItems: MenuItem[] = [];
  departments: any[] = [];

  constructor(
    private primengConfig: PrimeNGConfig,
    private router: Router,
    private menubarService: MenubarService
  ) {}

  ngOnInit(): void {
    this.initializeUserData();
    this.primengConfig.ripple = true;
    this.loadDepartments();
  }

  private initializeUserData(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.username = JSON.parse(user).first_name;
    }
    this.loadLocalStorageData();
  }

  private loadLocalStorageData(): void {
    this.modalityName = localStorage.getItem('modality_name') || '';
    this.modalityLegend = localStorage.getItem('modality_legend') || '';
    this.categoryName = localStorage.getItem('category_name') || '';
    this.categoryLegend = localStorage.getItem('category_legend') || '';
  }

  private loadDepartments(): void {
    this.menubarService.getDepartments().subscribe(
      (response) => this.handleDepartmentsResponse(response),
      (error) => this.handleError(error)
    );
  }

  private handleDepartmentsResponse(response: any): void {
    this.departments = response;
    this.departmentItems = this.departments.map((dp) => ({
      label: dp.name,
      url: `#department/${dp.id}`,
    }));
    this.buildMenuItems();
  }

  private buildMenuItems(): void {
    this.items = [
      {
        label: 'Departamentos',
        icon: 'pi pi-fw pi-bookmark',
        items: this.departmentItems,
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
  }

  private handleError(error: any): void {
    console.error('Error loading departments:', error);
    alert('Houve algum erro ao carregar a lista.');
  }

  public logout(): void {
    localStorage.clear();
    this.router.navigate(['login/']);
  }
}