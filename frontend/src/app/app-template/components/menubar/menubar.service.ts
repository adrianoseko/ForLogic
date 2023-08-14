import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MenubarService {
  url = localStorage.host + ':8000/departments/';

  constructor(private http: HttpClient) {}

  public getDepartments(): Observable<any> {
    const header = new HttpHeaders().set(
      'Authorization',
      'token ' + localStorage.token
    );
    return this.http.get(this.url, { headers: header });
  }
}
