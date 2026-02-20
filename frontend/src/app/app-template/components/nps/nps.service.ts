import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NpsService {

  private readonly apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.baseApiUrl}/api/Avaliacao`;
  }

  public getAvaliacao(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get<any>(this.apiUrl, { headers });
  }

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8'
    });
  }
}
