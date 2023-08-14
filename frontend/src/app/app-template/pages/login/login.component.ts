import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { Login } from './login';
import { LoginService } from './login.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent implements OnInit {
  loginform: any = [];
  form: FormGroup;
  currentCollection: any = [];
  authusergroup: any = [];
  display: any;
  username: string;
  password: string;
  msgs: any = [];
  inProgress: boolean;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private messageService: MessageService
  ) { }

  // -----
  loginForm: FormGroup;

  submitted = false;

  ngOnInit() {
    this.inProgress = false;
    localStorage.modality_name = '';
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  public onSubmit() {
    this.inProgress = true;
    this.submitted = true;
    localStorage.username = this.loginform.username;
    localStorage.host = 'http://localhost';
    localStorage.inicio = 0;
    localStorage.display = false;

    this.loginService
      .logar(this.loginform.username, this.loginform.password)
      .subscribe(
        (data) => {
          console.log(data);

          this.router.navigate(['home/']);

          localStorage.wlcbox = true;
        }
      );
  }
  public show() {
    this.msgs.push({
      severity: 'error',
      summary: 'Credenciais incorretas!',
      detail: 'Username ou senha inválidas.',
    });
  }

  public hide() {
    this.msgs = [];
  }
}
