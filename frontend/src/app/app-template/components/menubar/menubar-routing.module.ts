import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenubarComponent } from './menubar.component';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {
    path: 'menubar',
    component: MenubarComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenubarRoutingModule {}
