import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Transaccion } from '../Interfaces/transaccion';
import { Observable } from 'rxjs';
import { Result } from '../Interfaces/result';
import { Retiro } from '../Interfaces/retiro';


@Injectable({
  providedIn: 'root',
})
export class RetiroService {

  url = "http://192.167.0.114:8080/";
  private http = inject(HttpClient);

  transact(transaccion: Transaccion): Observable<Result<Retiro>>{
    return this.http.post<Result<Retiro>>(this.url+'Cajero/transact', transaccion);
  }
  
}
