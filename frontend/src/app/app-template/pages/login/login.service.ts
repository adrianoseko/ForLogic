import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment as env } from '../../../../environments/environment';
import { Login } from './login';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly PATH: string = '';

  constructor(private http: HttpClient) { }

  logar(username: string, password: string): Observable<any> {
    const header = new HttpHeaders().set(
      'Content-Type',
      'application/json; charset=utf-8'
    );
    console.log(env.baseApiUrl);
    const loginobj = { username: username, password: password };
    return this.http.get<any>('https://localhost:7136/api/Users/' + username + '/' + password, { headers: header });
  }
}