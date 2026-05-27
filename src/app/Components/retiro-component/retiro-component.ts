import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetiroService } from '../../Services/retiro-service';
import { UsuarioService } from '../../Services/usuario-service';
import { Retiro } from '../../Interfaces/retiro';
import { Transaccion } from '../../Interfaces/transaccion';
import { Router } from '@angular/router';

export interface DatosCliente {
  nombre: string;
  rango: string;
  saldo: number;
  numTarjeta: string;
}

type EstadoRetiro = 'cargando' | 'formulario' | 'procesando' | 'exito' | 'error';

const NUM_TARJETA_DEMO = '12345678123456781234';

@Component({
  selector: 'app-retiro-component',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './retiro-component.html',
  styleUrl: './retiro-component.css',
})
export class RetiroComponent implements OnInit {
  numTarjeta: string = '';
  idTarjeta: number = 0;
  idCajero: number = 0;

  estado: EstadoRetiro = 'cargando';
  cliente: DatosCliente = { nombre: '', rango: '', saldo: 0, numTarjeta: '' };
  errorCarga = '';

  monto: number | null = null;
  mensajeError = '';
  resultados: Retiro[] = [];
  tokenGuardado: string = '';

  constructor(
    private retiroService: RetiroService,
    private usuarioService: UsuarioService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.tokenGuardado = localStorage.getItem('token') || '';
    this.numTarjeta = localStorage.getItem('numTarjeta') || '';
    this.idCajero = parseInt(localStorage.getItem('idCajero') || '') || 0;
    localStorage.clear();
    if (this.tokenGuardado && this.numTarjeta && this.idCajero) {
      console.log('Token recuperado:', this.tokenGuardado);
      console.log('Num:', this.tokenGuardado);
      console.log('cajero:', this.tokenGuardado);
      
      this.cargarDatosCliente();
    } else {
      console.warn('Usuario no autenticado. Redirigiendo al login...');
      this.router.navigate(['/login']);
    }
  }

  private cargarDatosCliente(): void {
    this.estado = 'cargando';

    this.usuarioService.getDatosClientePorTarjeta(this.numTarjeta, this.tokenGuardado).subscribe({
      next: (datos) => {
        this.cliente = datos;
        this.idTarjeta = datos.numTarjeta ? parseInt(datos.numTarjeta) : 0;
        this.estado = 'formulario';
        console.log('Datos del cliente cargados:', datos);
      },
      error: (err) => {
        this.errorCarga = err?.message ?? 'No se pudieron cargar los datos de la tarjeta.';
        this.estado = 'error';
      },
    });
  }

  redondearMonto(): void {
    if (this.monto !== null && this.monto > 0) {
      this.monto = Math.round(this.monto * 2) / 2;
    }
  }

  get montoValido(): boolean {
    return (
      this.monto !== null &&
      this.monto > 0 &&
      (this.monto * 2) % 1 === 0 &&
      this.monto <= this.cliente.saldo
    );
  }

  get rangoClass(): string {
    const map: Record<string, string> = {
      Clásica: 'rango-clasica',
      Oro: 'rango-oro',
      Platino: 'rango-platino',
    };
    return map[this.cliente.rango] ?? 'rango-clasica';
  }

  confirmarRetiro(): void {
    if (!this.montoValido) return;

    const transaccion: Transaccion = {
      tarjeta: {
        idTarjeta: 0,
        NumTarjeta: this.cliente.numTarjeta,
      },
      cajero: { idCajero: this.idCajero, total: 0 },
      monto: this.monto!,
    };

    this.estado = 'procesando';
    console.log('Enviando transacción:', transaccion);
    this.retiroService.transact(transaccion, this.tokenGuardado).subscribe({
      next: (result) => {
        if (result.correct) {
          this.resultados = result.objects as Retiro[];
          this.estado = 'exito';
        } else {
          this.mensajeError = result.message ?? 'Error desconocido';
          this.estado = 'error';
        }
      },
      error: (err) => {
        this.mensajeError = err?.error?.message ?? 'No se pudo conectar con el servidor.';
        this.estado = 'error';
      },
    });
  }

  reiniciar(): void {
    this.monto = null;
    this.mensajeError = '';
    this.resultados = [];
    if (this.errorCarga) {
      this.errorCarga = '';
      this.cargarDatosCliente();
    } else {
      this.estado = 'formulario';
    }
  }
}
