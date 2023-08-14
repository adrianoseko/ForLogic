import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'menu',
    redirectTo: '/menu',
    pathMatch: 'full',
  },

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {
      useHash: true,
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
