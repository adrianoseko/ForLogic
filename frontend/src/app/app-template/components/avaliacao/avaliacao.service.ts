import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AvaliacaoService {
  private readonly baseApiUrl: string = environment.baseApiUrl;

  constructor(private http: HttpClient) {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
    });
  }

  getAvaliacao(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/Avaliacao`, { headers: this.createHeaders() });
  }

  getClientes(): Observable<any> {
    return this.http.get<any>(`${this.baseApiUrl}/Client`, { headers: this.createHeaders() });
  }

  postAvaliacao(form: any): Observable<any> {
    return this.http.post<any>(`${this.baseApiUrl}/Avaliacao`, form, { headers: this.createHeaders() });
  }
}