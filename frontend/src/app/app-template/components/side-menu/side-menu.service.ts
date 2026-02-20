import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SideMenuService {
  private readonly apiUrl: string = 'your-api-url'; // Define your API URL here

  constructor(private http: HttpClient) {}

  public getMenuItems(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/menu-items`, { headers: this.createHeaders() });
  }

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  }

  public handleError(error: any): void {
    console.error('An error occurred:', error); // Log the error for debugging
    // Additional error handling logic can be implemented here
  }
}