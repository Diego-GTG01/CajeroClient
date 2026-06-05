import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Cajero } from '../../Interfaces/cajero';
import { AuthService } from '../../Services/auth-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vista-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './vista-login.html',
  styleUrl: './vista-login.css',
})
export class VistaLogin {
  numTarjeta: string = '';
  pin: string = '';

  token?: string = '';
  cajero?: Cajero;

  constructor(
    private router: Router,
    private authService: AuthService,
    private location: Location,
  ) {
    localStorage.clear();
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.cajero = navigation.extras.state['cajeroSeleccionado'];
      console.log('Cajero recibido en Login:', this.cajero);
    }
  }

  volver(): void {
    this.location.back();
  }

  soloNumeros(event: KeyboardEvent): boolean {
    const charCode = event.key;
    if (/[0-9]/.test(charCode)) {
      return true;
    }
    event.preventDefault();
    return false;
  }

  iniciarSesion() {
    if (!this.numTarjeta || !this.pin) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, ingresa tu número de tarjeta y PIN.',
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
      title: 'Verificando credenciales',
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

    const datosAuth = {
      NumTarjeta: this.numTarjeta,
      pin: this.pin,
    };

    this.authService.auth(datosAuth).subscribe({
      next: (result: any) => {
        if (result && result.token) {
          localStorage.clear();
          localStorage.setItem('token', result.token);
          localStorage.setItem('numTarjeta', result.numTarjeta);
          if (this.cajero) {
            localStorage.setItem('idCajero', this.cajero.idCajero.toString());
          }

          Swal.fire({
            icon: 'success',
            title: '¡Acceso correcto!',
            text: 'Bienvenido al sistema.',
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              popup: 'swal-responsive-popup',
              title: 'swal-responsive-title',
              actions: 'swal-responsive-actions',
              confirmButton: 'swal-responsive-btn',
              cancelButton: 'swal-responsive-btn',
            },
          }).then(() => {
            this.router.navigate(['/retiro']);
          });
        } else {
          console.warn('El servidor no devolvió un token válido.');
          Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'No se pudo validar la sesión. Intente de nuevo.',
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
        console.warn('Error en la petición:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Número de tarjeta o PIN incorrectos, o problemas de conexión.',
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
}
