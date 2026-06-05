import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = 'http://192.167.0.168:8080/';
  private http = inject(HttpClient);

  auth(userAuth: { [key: string]: string }): Observable<any> {
    console.log('Datos a enviar:', userAuth);
    return this.http.post<any>(this.url + 'auth/login', userAuth);
  }
}
