import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../Interfaces/result';
import { Tarjeta } from '../Interfaces/tarjeta';
import { DefaultTitleStrategy } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TarjetaService {
  private http = inject(HttpClient);

  private url = 'http://192.167.0.168:8080';

  getTarjetasPorUsuario(idUsuario: number, token: string): Observable<Result<Tarjeta[]>> {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get<Result<Tarjeta[]>>(`${this.url}/tarjeta?idUsuario=${idUsuario}`, {
      headers,
    });
  }

  addTarjeta(tarjeta: Tarjeta, token: string): Observable<Result<Tarjeta>> {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.post<Result<Tarjeta>>(`${this.url}/tarjeta`, tarjeta, { headers });
  }

  deleteTarjeta(idTarjeta: number, token: string): Observable<HttpResponse<Result<any>>> {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.delete<Result<any>>(this.url + '/tarjeta?idTarjeta=' + idTarjeta, {
      headers,
      observe: 'response',
    });
  }
}
