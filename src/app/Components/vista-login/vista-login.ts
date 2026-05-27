import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Cajero } from '../../Interfaces/cajero';
import { AuthService } from '../../Services/auth-service';

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
  ) {
    localStorage.clear();
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.cajero = navigation.extras.state['cajeroSeleccionado'];
      console.log('Cajero recibido en Login:', this.cajero);
    }
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
    const datosAuth = {
      NumTarjeta: this.numTarjeta,
      pin: this.pin,
    };

    this.authService.auth(datosAuth).subscribe({
      next: (result: any) => {
        if (result && result.token) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('numTarjeta', result.numTarjeta);
          if (this.cajero) {
            localStorage.setItem('idCajero', this.cajero.idCajero.toString());
          }
          

          this.router.navigate(['/retiro']);
        } else {
          console.warn('El servidor no devolvió un token válido.');
        }

        console.log('Respuesta del servidor:', result);
      },
      error: (err) => {
        console.warn('Error en la petición:', err);
      },
    });
  }
}
