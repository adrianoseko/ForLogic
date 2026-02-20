import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { FullCalendarModule } from '@fullcalendar/angular';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { LoginModule } from './app-template/pages/login/login.module';
import { LoginRoutingModule } from './app-template/pages/login/login.routing.module';
import { HomeRoutingModule } from './app-template/pages/home/home.routing.module';

import { LoginComponent } from './app-template/pages/login/login.component';
import { HomeComponent } from './app-template/pages/home/home.component';
import { SideMenuComponent } from './app-template/components/side-menu/side-menu.component';
import { MenubarComponent } from './app-template/components/menubar/menubar.component';
import { FavoriteAppsComponent } from './app-template/components/favorite-apps/favorite-apps.component';
import { ClienteComponent } from './app-template/components/cliente/cliente.component';
import { UsersComponent } from './app-template/components/users/users.component';
import { AvaliacaoComponent } from './app-template/components/avaliacao/avaliacao.component';
import { NpsComponent } from './app-template/components/nps/nps.component';

import { PrimeNgModules } from './prime-ng.modules';

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  timeGridPlugin,
  interactionPlugin,
]);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SideMenuComponent,
    MenubarComponent,
    FavoriteAppsComponent,
    ClienteComponent,
    UsersComponent,
    AvaliacaoComponent,
    NpsComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    LoginModule,
    LoginRoutingModule,
    HomeRoutingModule,
    PrimeNgModules,
    AppRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
