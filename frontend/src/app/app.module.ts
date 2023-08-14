/**
 * Core Modules nd Components
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';

/**
 *  Login
 */
import { LoginModule } from './app-template/pages/login/login.module';
import { LoginRoutingModule } from './app-template/pages/login/login.routing.module';

/**
 *  Prime NG
 */
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TableModule } from 'primeng/table';
import { MenubarModule } from 'primeng/menubar';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { LoginComponent } from './app-template/pages/login/login.component';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CalendarModule } from 'primeng/calendar';
import { FieldsetModule } from 'primeng/fieldset';
import { CardModule } from 'primeng/card';
import { SlideMenuModule } from 'primeng/slidemenu';
import { GalleriaModule } from 'primeng/galleria';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TimelineModule } from 'primeng/timeline';
import { EditorModule } from 'primeng/editor';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { FileUploadModule } from 'primeng/fileupload';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ListboxModule } from 'primeng/listbox';
import { ChartModule } from 'primeng/chart';
import { SplitterModule } from 'primeng/splitter';
import { CheckboxModule } from 'primeng/checkbox';
import { TabViewModule } from 'primeng/tabview';
import { SidebarModule } from 'primeng/sidebar';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { TabMenuModule } from 'primeng/tabmenu';
import { TagModule } from 'primeng/tag';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DividerModule } from 'primeng/divider';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';

// fullcalendar
import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // a plugin!

FullCalendarModule.registerPlugins([
  // register FullCalendar plugins
  dayGridPlugin,
  timeGridPlugin,
  interactionPlugin,
]);

/**
 *   Extra Angular modules
 */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import {
  HttpClientModule,
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { HomeComponent } from './app-template/pages/home/home.component';
import { HomeRoutingModule } from './app-template/pages/home/home.routing.module';
import { SideMenuComponent } from './app-template/components/side-menu/side-menu.component';
import { MenubarComponent } from './app-template/components/menubar/menubar.component';
import { FavoriteAppsComponent } from './app-template/components/favorite-apps/favorite-apps.component';
import { ClienteComponent } from './app-template/components/cliente/cliente.component';
import { UsersComponent } from './app-template/components/users/users.component';
import { AvaliacaoComponent } from './app-template/components/avaliacao/avaliacao.component';
import { NpsComponent } from './app-template/components/nps/nps.component';

/***
 * Usar quando for utilizar os usuarios do Django
 * 
 * import { UsuariosRountingModule } from './app-template/usuarios/usuarios.routing.module';
 * import { UsuariosComponent } from './app-template/usuarios/usuarios.component';
 * import { novousuarioRountingModule } from './app-template/usuarios/novousuario/novousuario.router.module';
 * import { NovousuarioComponent } from './app-template/usuarios/novousuario/novousuario.component';
 * import { atualizarsuarioRountingModule } from './app-template/usuarios/atualizarsuarios/atualizarusuarios.routing.module';
 * import { AtualizarsuariosComponent } from './app-template/usuarios/atualizarsuarios/atualizarsuarios.component';
 * 
 */

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    // UsuariosComponent,
    // NovousuarioComponent,
    // AtualizarsuariosComponent,
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
    ButtonModule,
    PasswordModule,
    AccordionModule,
    TableModule,
    TagModule,
    PanelModule,
    PanelMenuModule,
    MenubarModule,
    ColorPickerModule,
    LoginModule,
    LoginRoutingModule,
    HomeRoutingModule,
    DialogModule,
    AppRoutingModule,
    InputMaskModule,
    InputNumberModule,
    InputTextModule,
    BrowserAnimationsModule,
    // UsuariosRountingModule,
    // novousuarioRountingModule,
    // atualizarsuarioRountingModule,
    ReactiveFormsModule,
    FormsModule,
    DividerModule,
    MenuModule,
    CalendarModule,
    CardModule,
    FieldsetModule,
    HttpClientModule,
    SlideMenuModule,
    GalleriaModule,
    DividerModule,
    VirtualScrollerModule,
    SelectButtonModule,
    TimelineModule,
    EditorModule,
    RadioButtonModule,
    MultiSelectModule,
    ToastModule,
    MessagesModule,
    MessageModule,
    ProgressSpinnerModule,
    SliderModule,
    ContextMenuModule,
    DropdownModule,
    ProgressBarModule,
    FileUploadModule,
    ToolbarModule,
    RatingModule,
    ConfirmDialogModule,
    InputTextareaModule,
    ListboxModule,
    ChartModule,
    TabViewModule,
    SplitterModule,
    FullCalendarModule,
    CheckboxModule,
    SidebarModule,
    AvatarModule,
    AvatarGroupModule,
    AccordionModule,
    TabMenuModule,
    AppRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
