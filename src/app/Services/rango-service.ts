import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rango } from '../Interfaces/rango';
import { Result } from '../Interfaces/result';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class RangoService {
  url = environment.apiUrl + '/rango';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Result<Rango[]>> {
    return this.http.get<Result<Rango[]>>(this.url);
  }
}
