import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CajeroService } from '../../Services/cajero-service';
import { Cajero } from '../../Interfaces/cajero';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vista-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vista-main.html',
  styleUrls: ['./vista-main.css'],
})
export class VistaMain implements OnInit {
  cajeros: Cajero[] = [];
  cargando: boolean = true;
  error: string = '';

  constructor(
    private router: Router,
    private cajeroService: CajeroService,
  ) {}

  ngOnInit(): void {
    this.cargarCajeros();
  }

  cargarCajeros(): void {
    this.cargando = true;

    this.cajeroService.getAllCajeros().subscribe({
      next: (result) => {
        console.log('Cajeros cargados:', result);
        this.cajeros = result.objects.flat() || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar cajeros:', err);
        this.error = 'No se pudieron cargar los cajeros';
        this.cargando = false;
      },
    });
  }

  cajeroSeleccionado?: Cajero;

  seleccionarCajero(cajero: Cajero): void {
    console.log('Cajero seleccionado:', cajero);
    const monto = cajero.total;

    if (monto <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Cajero No Disponible',
        text: 'Este cajero se encuentra sin fondos en este momento. Por favor, selecciona otro.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    if (monto < 5000) {
      Swal.fire({
        icon: 'warning',
        title: 'Poco Efectivo Disponible',
        text: `Este cajero tiene fondos limitados ($${monto}). ¿Deseas continuar de todos modos?`,
        showCancelButton: true,
        confirmButtonColor: ' #22c55e',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.redirigirAClase(cajero);
        }
      });
      return;
    }

    this.redirigirAClase(cajero);
  }

  private redirigirAClase(cajero: Cajero): void {
    this.router.navigate(['/login'], { state: { cajeroSeleccionado: cajero } });
  }

  obtenerEstado(monto: number): string {
    if (monto <= 0) {
      return 'Sin dinero';
    }
    if (monto < 5000) {
      return 'Poco efectivo';
    }
    return 'Disponible';
  }

  obtenerClaseEstado(monto: number): string {
    if (monto <= 0) {
      return 'resultado-icon resultado-icon--error';
    }
    if (monto < 5000) {
      return 'resultado-icon resultado-icon--warning';
    }
    return 'resultado-icon resultado-icon--success';
  }

  agregarCajero(): void {
    Swal.fire({
      title: 'Agregar Cajero',
      html: `
      <input id="ubicacion" class="swal2-input" placeholder="Ubicación del cajero">
    `,
      focusConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: ' #22c55e',
      cancelButtonColor: '#d33',
      reverseButtons: true,
      preConfirm: () => {
        const ubicacion = (document.getElementById('ubicacion') as HTMLInputElement).value;

        if (!ubicacion) {
          Swal.showValidationMessage('Por favor ingresa una ubicación válida y monto inicial');
          return null;
        }
        return { ubicacion };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const nuevoCajero: Cajero = {
          idCajero: 0,
          ubicacion: result.value.ubicacion,
          total: 0,
          estado: 'Activo',
        };
        console.log(nuevoCajero);

        this.cajeroService.addCajero(nuevoCajero).subscribe({
          next: () => {
            Swal.fire('Éxito', 'Cajero agregado correctamente', 'success');
            this.cargarCajeros();
          },
          error: (err) => {
            console.warn(err);
            Swal.fire('Error', 'No se pudo agregar el cajero', 'error');
          },
        });
      }
    });
  }

  agregarUsuario(): void {
    this.router.navigate(['/users']);
  }

  eliminarCajero(id: number, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: '¿Eliminar cajero?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: ' #22c55e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.cajeroService.deleteCajero(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El cajero fue eliminado', 'success');
            this.cargarCajeros();
          },
          error: (err) => {
            console.warn(err);
            Swal.fire('Error', 'No se pudo eliminar el cajero', 'error');
          },
        });
      }
    });
  }
  get totalSistema(): number {
    return this.cajeros.reduce((total, cajero) => total + (cajero.total || 0), 0);
  }
}
