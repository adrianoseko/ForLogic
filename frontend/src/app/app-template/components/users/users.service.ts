import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl: string = `${environment.baseApiUrl}/api/Users`;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    const headers = this.createHeaders();
    return this.http.get<User[]>(this.apiUrl, { headers });
  }

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
  }
}

export interface User {
  id: number;
  name: string;
  email: string;
  // Add other user properties as needed
}