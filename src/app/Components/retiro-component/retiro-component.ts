import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Location } from '@angular/common';
import { RetiroService } from '../../Services/retiro-service';
import { UsuarioService } from '../../Services/usuario-service';
import { Retiro } from '../../Interfaces/retiro';
import { Transaccion } from '../../Interfaces/transaccion';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Tarjeta } from '../../Interfaces/tarjeta';
import { TarjetaService } from '../../Services/tarjeta-service';
import { RangoService } from '../../Services/rango-service';
import { BancoService } from '../../Services/banco-service';
import { Banco } from '../../Interfaces/banco';
import { Rango } from '../../Interfaces/rango';

export interface DatosCliente {
  idUsuario?: number;
  nombre: string;
  rango: string;
  saldo: number;
  numTarjeta: string;
}

type EstadoRetiro = 'cargando' | 'formulario' | 'procesando' | 'exito' | 'error';

@Component({
  selector: 'app-retiro-component',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, ReactiveFormsModule],
  templateUrl: './retiro-component.html',
  styleUrl: './retiro-component.css',
})
export class RetiroComponent implements OnInit {
  numTarjeta: string = '';
  idTarjeta: number = 0;
  idCajero: number = 0;
  idUsuario: number = 0;

  estado: EstadoRetiro = 'cargando';
  cliente: DatosCliente = { idUsuario: 0, nombre: '', rango: '', saldo: 0, numTarjeta: '' };
  errorCarga = '';

  monto: number | null = null;
  mensajeError = '';
  resultados: Retiro[] = [];
  tarjetas: Tarjeta[] = [];

  bancos: Banco[] = [];
  rangos: Rango[] = [];
  tokenGuardado: string = '';

  tabActiva: string = 'retiro';

  verDatos: boolean = false;

  tarjetaForm!: FormGroup;
  tarjetaCreada: Tarjeta | null = null;

  constructor(
    private retiroService: RetiroService,
    private usuarioService: UsuarioService,
    private tarjetaService: TarjetaService,
    private rangoService: RangoService,
    private bancoService: BancoService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.tokenGuardado = localStorage.getItem('token') || '';
    this.numTarjeta = localStorage.getItem('numTarjeta') || '';
    this.idCajero = parseInt(localStorage.getItem('idCajero') || '') || 0;

    //localStorage.clear();

    if (this.tokenGuardado && this.numTarjeta && this.idCajero) {
      this.cargarDatosCliente();

      this.cargarRangos();
      this.cargarBancos();
    } else {
      console.warn('Usuario no autenticado. Redirigiendo al login...');
      Swal.fire({
        icon: 'warning',
        title: 'Sesión no válida',
        text: 'Por favor, inicie sesión nuevamente.',
        confirmButtonColor: '#3085d6',
        customClass: {
          popup: 'swal-responsive-popup',
          title: 'swal-responsive-title',
          actions: 'swal-responsive-actions',
          confirmButton: 'swal-responsive-btn',
          cancelButton: 'swal-responsive-btn',
        },
      }).then(() => {
        this.router.navigate(['/login']);
      });
    }
  }
  initForm(): void {
    this.tarjetaForm = this.fb.group({
      idUsuario: [this.idUsuario, Validators.required],
      idBanco: ['', Validators.required],
      idRango: ['', Validators.required],
      pin: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
    });
  }
  private cargarTarjetas(): void {
    this.tarjetaService.getTarjetasPorUsuario(this.idUsuario, this.tokenGuardado).subscribe({
      next: (result) => {
        if (result.correct) {
          this.tarjetas = result.objects.flat() as Tarjeta[];
          console.log('Tarjetas cargadas:', this.tarjetas);
        }
      },
      error: (err) => {
        console.error('Error al cargar tarjetas:', err);
      },
    });
  }

  private cargarDatosCliente(): void {
    this.estado = 'cargando';
    Swal.fire({
      title: 'Cargando datos de la cuenta',
      text: 'Por favor espere...',
      allowOutsideClick: false,
      customClass: {
        popup: 'swal-responsive-popup',
        title: 'swal-responsive-title',
        actions: 'swal-responsive-actions',
        confirmButton: 'swal-responsive-btn',
        cancelButton: 'swal-responsive-btn',
      },
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.usuarioService.getDatosClientePorTarjeta(this.numTarjeta, this.tokenGuardado).subscribe({
      next: (datos) => {
        this.cliente = datos;
        this.idUsuario = datos.idUsuario || 0;
        this.initForm();
        this.cargarTarjetas();
        this.idTarjeta = datos.numTarjeta ? parseInt(datos.numTarjeta) : 0;
        this.estado = 'formulario';
        Swal.close();
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
          customClass: {
            popup: 'swal-responsive-popup',
            title: 'swal-responsive-title',
            actions: 'swal-responsive-actions',
            confirmButton: 'swal-responsive-btn',
            cancelButton: 'swal-responsive-btn',
          },
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
      customClass: {
        popup: 'swal-responsive-popup',
        title: 'swal-responsive-title',
        actions: 'swal-responsive-actions',
        confirmButton: 'swal-responsive-btn',
        cancelButton: 'swal-responsive-btn',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        this.router.navigate(['/']);
      }
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
        customClass: {
          popup: 'swal-responsive-popup',
          title: 'swal-responsive-title',
          actions: 'swal-responsive-actions',
          confirmButton: 'swal-responsive-btn',
          cancelButton: 'swal-responsive-btn',
        },
      });
      return;
    }

    if (this.monto > this.cliente.saldo) {
      Swal.fire({
        icon: 'error',
        title: 'Saldo insuficiente',
        text: `No tienes fondos suficientes. Tu saldo actual es de $${this.cliente.saldo}`,
        confirmButtonColor: '#3085d6',
        customClass: {
          popup: 'swal-responsive-popup',
          title: 'swal-responsive-title',
          actions: 'swal-responsive-actions',
          confirmButton: 'swal-responsive-btn',
          cancelButton: 'swal-responsive-btn',
        },
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
      customClass: {
        popup: 'swal-responsive-popup',
        title: 'swal-responsive-title',
        actions: 'swal-responsive-actions',
        confirmButton: 'swal-responsive-btn',
        cancelButton: 'swal-responsive-btn',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarRetiro();
      }
    });
  }

  private procesarRetiro(): void {
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
      customClass: {
        popup: 'swal-responsive-popup',
        title: 'swal-responsive-title',
        actions: 'swal-responsive-actions',
        confirmButton: 'swal-responsive-btn',
        cancelButton: 'swal-responsive-btn',
      },
      didOpen: () => {
        Swal.showLoading();
      },
    });

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
            customClass: {
              popup: 'swal-responsive-popup',
              title: 'swal-responsive-title',
              actions: 'swal-responsive-actions',
              confirmButton: 'swal-responsive-btn',
              cancelButton: 'swal-responsive-btn',
            },
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
            customClass: {
              popup: 'swal-responsive-popup',
              title: 'swal-responsive-title',
              actions: 'swal-responsive-actions',
              confirmButton: 'swal-responsive-btn',
              cancelButton: 'swal-responsive-btn',
            },
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
          customClass: {
            popup: 'swal-responsive-popup',
            title: 'swal-responsive-title',
            actions: 'swal-responsive-actions',
            confirmButton: 'swal-responsive-btn',
            cancelButton: 'swal-responsive-btn',
          },
        });
      },
    });
  }
  guardarTarjeta(): void {
    if (!this.tarjetaForm.valid) {
      this.tarjetaForm.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor corrige los errores antes de continuar.',
        customClass: {
          popup: 'swal-responsive-popup',
          title: 'swal-responsive-title',
          actions: 'swal-responsive-actions',
          confirmButton: 'swal-responsive-btn',
          cancelButton: 'swal-responsive-btn',
        },
      });

      return;
    }

    this.crearTarjeta();

    // Mostrar un loader mientras se procesa la creación en el servidor
    Swal.fire({
      title: 'Creando tarjeta...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      customClass: {
        popup: 'swal-responsive-popup',
        title: 'swal-responsive-title',
        actions: 'swal-responsive-actions',
        confirmButton: 'swal-responsive-btn',
        cancelButton: 'swal-responsive-btn',
      },
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.tarjetaService.addTarjeta(this.tarjetaCreada!, this.tokenGuardado).subscribe({
      next: (result) => {
        if (result.correct) {
          const tarjetaRetornada =
            result.object || (result.objects ? result.objects[0] : null) || this.tarjetaCreada;

          const bancoSeleccionado = this.bancos.find(
            (b) => b.idBanco === Number(this.tarjetaForm.value.idBanco),
          );
          const rangoSeleccionado = this.rangos.find(
            (r) => r.idRango === Number(this.tarjetaForm.value.idRango),
          );

          const nombreBanco = bancoSeleccionado ? bancoSeleccionado.nombre : 'No especificado';
          const nombreRango = rangoSeleccionado ? rangoSeleccionado.nombre : 'No especificado';

          const numeroTarjeta =
            tarjetaRetornada?.NumTarjeta || tarjetaRetornada?.NumTarjeta || 'Generando...';
          this.cargarTarjetas();

          Swal.fire({
            icon: 'success',
            title: '¡Tarjeta creada exitosamente!',
            html: `
              <div style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
                <p><strong>Número de Tarjeta:</strong> <span style="color: #007bff; font-size: 1.1em;">${numeroTarjeta}</span></p>
                <p><strong>Banco:</strong> ${nombreBanco}</p>
                <p><strong>Categoría/Rango:</strong> ${nombreRango}</p>
                <p style="color: #dc3545; font-size: 0.9em;">* Recuerda el PIN asignado de 4 dígitos.</p>
              </div>
            `,
            confirmButtonColor: '#28a745',
            confirmButtonText: 'Entendido',
            customClass: {
              popup: 'swal-responsive-popup',
              title: 'swal-responsive-title',
              actions: 'swal-responsive-actions',
              confirmButton: 'swal-responsive-btn',
              cancelButton: 'swal-responsive-btn',
            },
          }).then(() => {
            this.cargarTarjetas();
            this.tarjetaForm.reset({ idUsuario: this.idUsuario });
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error al crear tarjeta',
            text: result.message ?? 'Error desconocido',
            confirmButtonColor: '#d33',
            customClass: {
              popup: 'swal-responsive-popup',
              title: 'swal-responsive-title',
              actions: 'swal-responsive-actions',
              confirmButton: 'swal-responsive-btn',
              cancelButton: 'swal-responsive-btn',
            },
          });
        }
        this.tarjetaForm.reset({ idUsuario: this.idUsuario });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear tarjeta',
          text: 'No se pudo conectar con el servidor.',
          confirmButtonColor: '#d33',
          customClass: {
            popup: 'swal-responsive-popup',
            title: 'swal-responsive-title',
            actions: 'swal-responsive-actions',
            confirmButton: 'swal-responsive-btn',
            cancelButton: 'swal-responsive-btn',
          },
        });
      },
    });
  }

  crearTarjeta(): void {
    this.tarjetaCreada = this.tarjetaForm.value;
  }
  cargarRangos(): void {
    this.rangoService.getAll().subscribe({
      next: (result) => {
        this.rangos = result.objects.flat();
      },
      error: (err) => {
        console.warn(err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible cargar los rangos.',
          customClass: {
            popup: 'swal-responsive-popup',
            title: 'swal-responsive-title',
            actions: 'swal-responsive-actions',
            confirmButton: 'swal-responsive-btn',
            cancelButton: 'swal-responsive-btn',
          },
        });
      },
    });
  }

  cargarBancos(): void {
    this.bancoService.getAll().subscribe({
      next: (result) => {
        this.bancos = result.objects.flat();
      },
      error: (err) => {
        console.warn(err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible cargar los bancos.',
          customClass: {
            popup: 'swal-responsive-popup',
            title: 'swal-responsive-title',
            actions: 'swal-responsive-actions',
            confirmButton: 'swal-responsive-btn',
            cancelButton: 'swal-responsive-btn',
          },
        });
      },
    });
  }

  eliminarTarjeta(tarjeta: Tarjeta): void {
    const idTarjetaAEliminar = tarjeta.idTarjeta;
    const mascaraTarjeta = `**** **** **** ${tarjeta.NumTarjeta?.slice(-4)}`;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la tarjeta que termina en ${tarjeta.NumTarjeta?.slice(-4)}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'swal-responsive-popup',
        title: 'swal-responsive-title',
        actions: 'swal-responsive-actions',
        confirmButton: 'swal-responsive-btn',
        cancelButton: 'swal-responsive-btn',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando tarjeta...',
          allowOutsideClick: false,
          customClass: {
            popup: 'swal-responsive-popup',
            title: 'swal-responsive-title',
            actions: 'swal-responsive-actions',
            confirmButton: 'swal-responsive-btn',
            cancelButton: 'swal-responsive-btn',
          },
          didOpen: () => {
            Swal.showLoading();
          },
        });

        this.tarjetaService.deleteTarjeta(idTarjetaAEliminar, this.tokenGuardado).subscribe({
          next: (res) => {
            const resultBody = res.body;

            if (res.status === 204) {
              Swal.fire({
                icon: 'success',
                title: '¡Eliminada!',
                text: `La tarjeta ha sido removida correctamente.`,
                customClass: {
                  popup: 'swal-responsive-popup',
                  title: 'swal-responsive-title',
                  actions: 'swal-responsive-actions',
                  confirmButton: 'swal-responsive-btn',
                  cancelButton: 'swal-responsive-btn',
                },
                confirmButtonColor: '#28a745',
              });
              this.cargarTarjetas();
            } else {
              Swal.fire({
                icon: 'error',
                title: `Error al eliminar`,
                text: resultBody?.message ?? 'No se pudo eliminar la tarjeta.',
                confirmButtonColor: '#3085d6',
                customClass: {
                  popup: 'swal-responsive-popup',
                  title: 'swal-responsive-title',
                  actions: 'swal-responsive-actions',
                  confirmButton: 'swal-responsive-btn',
                  cancelButton: 'swal-responsive-btn',
                },
              });
            }
          },
          error: (err) => {
            console.error(err);
            const errorStatus = err.status;

            Swal.fire({
              icon: 'error',
              title: `Error de servidor (${errorStatus})`,
              text: err?.error?.message ?? 'Hubo un problema al comunicarse con el servidor.',
              confirmButtonColor: '#3085d6',
              customClass: {
                popup: 'swal-responsive-popup',
                title: 'swal-responsive-title',
                actions: 'swal-responsive-actions',
                confirmButton: 'swal-responsive-btn',
                cancelButton: 'swal-responsive-btn',
              },
            });
          },
        });
      }
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
