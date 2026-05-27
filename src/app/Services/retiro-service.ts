import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Transaccion } from '../Interfaces/transaccion';
import { Observable } from 'rxjs';
import { Result } from '../Interfaces/result';
import { Retiro } from '../Interfaces/retiro';

@Injectable({
  providedIn: 'root',
})
export class RetiroService {
  url = 'http://localhost:8080/';
  private http = inject(HttpClient);

  transact(transaccion: Transaccion, token: string): Observable<Result<Retiro>> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post<Result<Retiro>>(this.url + 'Cajero/transact', transaccion, {headers});
  }
}
