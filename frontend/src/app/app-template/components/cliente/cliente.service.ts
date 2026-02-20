import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private readonly apiUrl: string = `${environment.baseApiUrl}/api/Client`;

  constructor(private http: HttpClient) {}

  getClients(): Observable<any> {
    return this.http.get<any>(this.apiUrl, this.getHttpOptions());
  }

  postClient(clientData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, clientData, this.getHttpOptions());
  }

  private getHttpOptions(): { headers: HttpHeaders } {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8',
    });
    return { headers };
  }
}