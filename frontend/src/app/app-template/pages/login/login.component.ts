import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from './login.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted: boolean = false;
  inProgress: boolean = false;
  msgs: any[] = [];

  constructor(
    private router: Router,
    private loginService: LoginService,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.resetLocalStorage();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  private resetLocalStorage(): void {
    localStorage.clear();
    localStorage.setItem('modality_name', '');
    localStorage.setItem('host', 'http://localhost');
    localStorage.setItem('inicio', '0');
    localStorage.setItem('display', 'false');
  }

  public onSubmit(): void {
    this.inProgress = true;
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.inProgress = false;
      return;
    }

    const { username, password } = this.loginForm.value;
    localStorage.setItem('username', username);

    this.loginService.logar(username, password).subscribe({
      next: (data) => this.handleLoginSuccess(data),
      error: () => this.handleLoginError(),
    });
  }

  private handleLoginSuccess(data: any): void {
    console.log(data);
    this.router.navigate(['home/']);
    localStorage.setItem('wlcbox', 'true');
  }

  private handleLoginError(): void {
    this.inProgress = false;
    this.msgs.push({
      severity: 'error',
      summary: 'Credenciais incorretas!',
      detail: 'Username ou senha inválidas.',
    });
  }

  public hideMessages(): void {
    this.msgs = [];
  }
}