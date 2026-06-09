import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = environment.apiUrl;
  private http = inject(HttpClient);

  auth(userAuth: { [key: string]: string }): Observable<any> {
    return this.http.post<any>(this.url + '/auth/login', userAuth);
  }
}
