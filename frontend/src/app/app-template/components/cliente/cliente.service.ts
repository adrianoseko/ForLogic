import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment as env } from '../../../../environments/environment';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private readonly PATH: string = '';

  constructor(private http: HttpClient) { }

  getClientes(): Observable<any> {
    const header = new HttpHeaders().set(
      'Content-Type',
      'application/json; charset=utf-8'
    );
    console.log(env.baseApiUrl);
    return this.http.get<any>('https://localhost:7136/api/Client')
  }

  postClient(form) {
    const header = new HttpHeaders().set(
      'Content-Type',
      'application/json; charset=utf-8'
    );
    console.log(form);
    return this.http.post('https://localhost:7136/api/Client', form)
  }


}