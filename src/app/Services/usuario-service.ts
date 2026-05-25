import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Result } from '../Interfaces/result';
import { SaldoInfo } from '../Interfaces/saldo-info';
import { DatosCliente } from '../Components/retiro-component/retiro-component';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private url = 'http://localhost:8080/usuario';
  private http = inject(HttpClient);

 
  getDatosClientePorTarjeta(numTarjeta: string): Observable<DatosCliente> {
    return this.http
      .get<Result<SaldoInfo>>(`${this.url}/saldo/${numTarjeta}`)
      .pipe(
        map((result) => {
          console.log('Respuesta del servidor para saldo:', result);
          if (!result.correct || !result.object) {
            throw new Error(result.message ?? 'Error al obtener datos del cliente');
          }
          const info = result.object as SaldoInfo;
          return {
            nombre: info.nombreUsuario,
            rango: info.rango,
            saldo: info.saldo,
            numTarjeta: info.numTarjeta
          } satisfies DatosCliente;
        })
      );
  }
}