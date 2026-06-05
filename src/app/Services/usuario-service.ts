import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Result } from '../Interfaces/result';
import { SaldoInfo } from '../Interfaces/saldo-info';
import { DatosCliente } from '../Components/retiro-component/retiro-component';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private url = 'http://192.167.0.168:8080/usuario';
  private http = inject(HttpClient);

  getDatosClientePorTarjeta(numTarjeta: string, token: string): Observable<DatosCliente> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Result<SaldoInfo>>(`${this.url}/saldo/${numTarjeta}`, { headers }).pipe(
      map((result) => {
        console.log('Respuesta del servidor para saldo:', result);
        if (!result.correct || !result.object) {
          throw new Error(result.message ?? 'Error al obtener datos del cliente');
        }
        const info = result.object as SaldoInfo;
        return {
          idUsuario: info.idUsuario, 
          nombre: info.nombreUsuario,
          rango: info.rango,
          saldo: info.saldo,
          numTarjeta: info.numTarjeta,
        } satisfies DatosCliente;
      }),
    );
  }

  createCliente(request: Record<string, any>): Observable<Result<any>> {
    return this.http.post<Result<any>>(`${this.url}/create`, request);
  }
}
