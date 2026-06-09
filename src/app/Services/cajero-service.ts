import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Cajero } from '../Interfaces/cajero';
import { Result } from '../Interfaces/result';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 
@Injectable({
  providedIn: 'root',
})
export class CajeroService {
  url = environment.apiUrl + '/cajero';
  private http = inject(HttpClient);

  getAllCajeros(): Observable<Result<Cajero[]>> {
    return this.http.get<Result<Cajero[]>>(this.url + '/getAll');
  }

  addCajero(cajero: Cajero): Observable<Result<Cajero>> {
    return this.http.post<Result<Cajero>>(this.url + '/add', cajero);
  }

  deleteCajero(idCajero: number): Observable<Result<any>> {
    return this.http.delete<Result<any>>(this.url + '/delete/' + idCajero);
  }
}
