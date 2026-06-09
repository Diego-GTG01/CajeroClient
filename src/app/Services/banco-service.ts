import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../Interfaces/result';
import { Banco } from '../Interfaces/banco';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class BancoService {
  url = environment.apiUrl + '/banco';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Result<Banco[]>> {
    return this.http.get<Result<Banco[]>>(this.url);
  }



  cargarBancos(bancos: Banco[]): void {
    this.getAll().subscribe({
      next: (result) => {
        bancos = result.objects.flat();
      },
      error: (err) => {
        console.warn(err);
        bancos = [];

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible cargar los bancos.',
        });
      },
    });
  }
}
