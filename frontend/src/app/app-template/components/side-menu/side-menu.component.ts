import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {
  items: MenuItem[] = [];

  constructor() {}

  ngOnInit(): void {
    this.initializeMenuItems();
  }

  private initializeMenuItems(): void {
    // Initialize menu items here if needed
    // Example: this.items = [{ label: 'Home', icon: 'pi pi-fw pi-home', routerLink: ['/'] }];
  }
}