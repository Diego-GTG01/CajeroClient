import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { RetiroService } from '../../Services/retiro-service';
import { UsuarioService } from '../../Services/usuario-service';
import { Retiro } from '../../Interfaces/retiro';
import { Transaccion } from '../../Interfaces/transaccion';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

export interface DatosCliente {
  nombre: string;
  rango: string;
  saldo: number;
  numTarjeta: string;
}

type EstadoRetiro = 'cargando' | 'formulario' | 'procesando' | 'exito' | 'error';

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
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.tokenGuardado = localStorage.getItem('token') || '';
    this.numTarjeta = localStorage.getItem('numTarjeta') || '';
    this.idCajero = parseInt(localStorage.getItem('idCajero') || '') || 0;

    //localStorage.clear();

    if (this.tokenGuardado && this.numTarjeta && this.idCajero) {
      console.log('Token recuperado:', this.tokenGuardado);
      this.cargarDatosCliente();
    } else {
      console.warn('Usuario no autenticado. Redirigiendo al login...');
      Swal.fire({
        icon: 'warning',
        title: 'Sesión no válida',
        text: 'Por favor, inicie sesión nuevamente.',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  private cargarDatosCliente(): void {
    this.estado = 'cargando';
    Swal.fire({
      title: 'Cargando datos de la cuenta',
      text: 'Por favor espere...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.usuarioService.getDatosClientePorTarjeta(this.numTarjeta, this.tokenGuardado).subscribe({
      next: (datos) => {
        this.cliente = datos;
        this.idTarjeta = datos.numTarjeta ? parseInt(datos.numTarjeta) : 0;
        this.estado = 'formulario';
        Swal.close();
        console.log('Datos del cliente cargados:', datos);
      },
      error: (err) => {
        this.errorCarga = err?.message ?? 'No se pudieron cargar los datos de la tarjeta.';
        this.estado = 'error';

        Swal.fire({
          icon: 'error',
          title: 'Error de carga',
          text: this.errorCarga,
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#3085d6',
        }).then(() => {
          this.router.navigate(['/']);
        });
      },
    });
  }

  redondearMonto(): void {
    if (this.monto !== null && this.monto > 0) {
      this.monto = Math.round(this.monto * 2) / 2;
    }
  }

  volver(): void {
    Swal.fire({
      title: '¿Seguro que quiere salir?',
      text: `Se redirijirá a los cajeros`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Salir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      this.router.navigate(['/']);
    });
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
    if (this.monto === null || this.monto <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Monto inválido',
        text: 'Por favor, ingresa un monto mayor a 0.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (this.monto > this.cliente.saldo) {
      Swal.fire({
        icon: 'error',
        title: 'Saldo insuficiente',
        text: `No tienes fondos suficientes. Tu saldo actual es de $${this.cliente.saldo}`,
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    Swal.fire({
      title: '¿Confirmar retiro?',
      text: `¿Estás seguro de que deseas retirar $${this.monto}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, retirar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarRetiro();
      }
    });
  }

  private procesarRetiro(): void {
    console.log('Iniciando proceso de retiro para monto:', this.monto);
    const transaccion: Transaccion = {
      tarjeta: {
        idTarjeta: 0,
        NumTarjeta: this.cliente.numTarjeta,
      },
      cajero: { idCajero: this.idCajero, total: 0 },
      monto: this.monto!,
    };

    this.estado = 'procesando';

    Swal.fire({
      title: 'Procesando transacción',
      text: 'Entregando dinero, por favor no retire su tarjeta...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    console.log('Enviando transacción:', transaccion);
    this.retiroService.transact(transaccion, this.tokenGuardado).subscribe({
      next: (result) => {
        if (result.correct) {
          this.resultados = result.objects as Retiro[];
          this.estado = 'exito';

          Swal.fire({
            icon: 'success',
            title: '¡Retiro exitoso!',
            text: 'Por favor, tome su dinero del dispensador.',
            confirmButtonColor: '#28a745',
          }).then(() => {
            this.cliente.saldo -= this.monto ?? 0;
          });
        } else {
          this.mensajeError = result.message ?? 'Error desconocido';
          this.estado = 'error';

          Swal.fire({
            icon: 'error',
            title: 'Transacción rechazada',
            text: this.mensajeError,
            confirmButtonColor: '#d33',
          });
        }
      },
      error: (err) => {
        this.mensajeError = err?.error?.message ?? 'No se pudo conectar con el servidor.';
        this.estado = 'error';

        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: this.mensajeError,
          confirmButtonColor: '#d33',
        });
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
