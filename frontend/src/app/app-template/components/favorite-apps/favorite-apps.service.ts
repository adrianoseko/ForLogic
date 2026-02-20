import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FavoriteAppsService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${localStorage.host}:8000/app-index-favorites/`;
  }

  public getApps(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.createAuthorizationHeader() });
  }

  public addHit(app: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${app.id}/`, app, { headers: this.createAuthorizationHeader() });
  }

  private createAuthorizationHeader(): HttpHeaders {
    const token = localStorage.token;
    if (!token) {
      throw new Error('Authorization token is missing');
    }
    return new HttpHeaders().set('Authorization', `token ${token}`);
  }
}