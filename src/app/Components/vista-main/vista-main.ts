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
        confirmButtonText: 'Entendido'
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
}