import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Cajero } from '../Interfaces/cajero';
import { Result } from '../Interfaces/result';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CajeroService {
  url = 'http://localhost:8080/';
  private http = inject(HttpClient);

  getAllCajeros(): Observable<Result<Cajero[]>> {
    return this.http.get<Result<Cajero[]>>(this.url + 'cajero/getAll');
  }

  addCajero(cajero: Cajero): Observable<Result<Cajero>> {
    return this.http.post<Result<Cajero>>(this.url + 'cajero/add', cajero);
  }

  deleteCajero(idCajero: number): Observable<Result<any>> {
    return this.http.delete<Result<any>>(this.url + 'cajero/delete/' + idCajero);
  }
}
