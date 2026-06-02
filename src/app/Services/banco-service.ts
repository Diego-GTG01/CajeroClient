import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../Interfaces/result';
import { Banco } from '../Interfaces/banco';

@Injectable({
  providedIn: 'root',
})
export class BancoService {
  url = 'http://localhost:8080/banco';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Result<Banco[]>> {
    return this.http.get<Result<Banco[]>>(this.url);
  }
}
