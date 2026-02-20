import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly apiUrl: string = `${environment.baseApiUrl}/api/Users`;

  constructor(private http: HttpClient) { }

  logIn(username: string, password: string): Observable<any> {
    const headers = this.createHeaders();
    const loginPayload = this.createLoginPayload(username, password);
    return this.http.get<any>(`${this.apiUrl}/${username}/${password}`, { headers });
  }

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
    });
  }

  private createLoginPayload(username: string, password: string): { username: string; password: string } {
    return { username, password };
  }
}