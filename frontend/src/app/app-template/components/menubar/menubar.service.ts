import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MenubarService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${localStorage.getItem('host')}:8000/departments/`;
  }

  public getDepartments(): Observable<Department[]> {
    const headers = this.createAuthorizationHeader();
    return this.http.get<Department[]>(this.apiUrl, { headers });
  }

  private createAuthorizationHeader(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authorization token is missing');
    }
    return new HttpHeaders().set('Authorization', `token ${token}`);
  }
}

interface Department {
  id: number;
  name: string;
  // Add other relevant fields here
}