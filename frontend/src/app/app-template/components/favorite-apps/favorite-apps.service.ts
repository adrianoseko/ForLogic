import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FavoriteAppsService {
  url = localStorage.host + ':8000/app-index-favorites/';

  constructor(private http: HttpClient) {}

  public getApps(): Observable<any> {
    const header = new HttpHeaders().set(
      'Authorization',
      'token ' + localStorage.token
    );
    return this.http.get(this.url, { headers: header });
  }

  public addHit(index: any): Observable<any> {
    const header = new HttpHeaders().set(
      'Authorization',
      'token ' + localStorage.token
    );
    return this.http.put<any>(this.url + index.id + '/', index, {
      headers: header,
    });
  }
}
