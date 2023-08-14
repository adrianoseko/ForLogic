import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment as env } from '../../../../environments/environment';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly PATH: string = '';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    const header = new HttpHeaders().set(
      'Content-Type',
      'application/json; charset=utf-8'
    );
    console.log(env.baseApiUrl);
    return this.http.get<any>('https://localhost:7136/api/Users')
  }
}