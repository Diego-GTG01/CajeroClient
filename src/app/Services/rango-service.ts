import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rango } from '../Interfaces/rango';
import { Result } from '../Interfaces/result';

@Injectable({
  providedIn: 'root',
})
export class RangoService {
  url = 'http://localhost:8080/rango';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Result<Rango[]>> {
    return this.http.get<Result<Rango[]>>(this.url);
  }
}
