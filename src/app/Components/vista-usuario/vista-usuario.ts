import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { Rango } from '../../Interfaces/rango';
import { Banco } from '../../Interfaces/banco';
import { Usuario } from '../../Interfaces/usuario';
import { Tarjeta } from '../../Interfaces/tarjeta';
import { Cuenta } from '../../Interfaces/cuenta';
import { CreateClienteRequest } from '../../Interfaces/create-cliente-request';
import { BancoService } from '../../Services/banco-service';
import { RangoService } from '../../Services/rango-service';
import { UsuarioService } from '../../Services/usuario-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vista-usuario',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './vista-usuario.html',
  styleUrl: './vista-usuario.css',
})
export class VistaUsuario implements OnInit {
  usuarioForm!: FormGroup;
  request!: CreateClienteRequest;

  usuario: Usuario = {
    idUsuario: 0,
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    celular: '',
    telefono: '',
    email: '',
  };

  tarjeta: Tarjeta = {
    idTarjeta: 0,
    pin: '',
    rango: {
      idRango: 0,
      nombre: '',
      minRetiro: 0,
      maxRetiro: 0,
    },
    banco: {
      idBanco: 0,
      nombre: '',
    },
  };

  cuenta: Cuenta = {
    idCuenta: 0,
    usuario: this.usuario,
    NumCuenta: 0,
    saldo: 0,
    banco: undefined,
  };

  rangos: Rango[] = [];
  bancos: Banco[] = [];

  constructor(
    private bancoService: BancoService,
    private rangoService: RangoService,
    private usuarioService: UsuarioService,
    private router: Router,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.cargarRangos();
    this.cargarBancos();
    this.initForm();
  }

  initForm(): void {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellidoPaterno: ['', [Validators.required, Validators.maxLength(50)]],
      apellidoMaterno: ['', [Validators.maxLength(50)]],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]{10,20}$')]],
      telefono: ['', [Validators.pattern('^[0-9]{10,20}$')]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      idBanco: ['', Validators.required],
      idRango: ['', Validators.required],
      saldoInicial: [0, [Validators.required, Validators.min(0)]],
      pin: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
    });
  }

  crearUsuario(): void {
    this.usuario.nombre = this.usuarioForm.value.nombre;
    this.usuario.apellidoPaterno = this.usuarioForm.value.apellidoPaterno;
    this.usuario.apellidoMaterno = this.usuarioForm.value.apellidoMaterno;
    this.usuario.celular = this.usuarioForm.value.celular;
    this.usuario.telefono = this.usuarioForm.value.telefono;
    this.usuario.email = this.usuarioForm.value.email;
  }

  crearCuenta(): void {
    this.cuenta.saldo = this.usuarioForm.value.saldoInicial;

    const idBancoSeleccionado = Number(this.usuarioForm.value.idBanco);

    this.cuenta.banco = this.bancos.find((b) => b.idBanco === idBancoSeleccionado);
  }

  crearTarjeta(): void {
    this.tarjeta.pin = this.usuarioForm.value.pin;

    const idRangoSeleccionado = Number(this.usuarioForm.value.idRango);
    const idBancoSeleccionado = Number(this.usuarioForm.value.idBanco);

    this.tarjeta.rango = this.rangos.find((r) => r.idRango === idRangoSeleccionado)!;

    this.tarjeta.banco = this.bancos.find((b) => b.idBanco === idBancoSeleccionado)!;
  }

  onSubmit(): void {
    if (!this.usuarioForm.valid) {
      this.usuarioForm.markAllAsTouched();

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

    this.crearUsuario();
    this.crearCuenta();
    this.crearTarjeta();

    this.request = {
      usuario: this.usuario,
      cuenta: this.cuenta,
      tarjeta: this.tarjeta,
    };

    Swal.fire({
      title: 'Creando cliente...',
      text: 'Espere un momento',
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

    this.usuarioService.createCliente(this.request).subscribe({
      next: (result) => {
        Swal.close();

        console.log('Respuesta del servidor:', result);

        if (result.correct) {
          const usuario = result.object.usuario;
          const cuenta = result.object.cuenta;
          const tarjeta = result.object.tarjeta;

          Swal.fire({
            icon: 'success',
            title: 'Cliente creado exitosamente',
            width: '750px',
            html: `
              <div style="text-align:left">

                <h3 style="margin-bottom:10px;">👤 Cliente</h3>
                <table style="width:100%; margin-bottom:15px;">
                  <tr>
                    <td><strong>Nombre:</strong></td>
                    <td>${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno ?? ''}</td>
                  </tr>
                  <tr>
                    <td><strong>Correo:</strong></td>
                    <td>${usuario.email ?? ''}</td>
                  </tr>
                  <tr>
                    <td><strong>Celular:</strong></td>
                    <td>${usuario.celular ?? ''}</td>
                  </tr>
                </table>

                <hr>

                <h3 style="margin:15px 0 10px;">🏦 Cuenta Bancaria</h3>
                <table style="width:100%; margin-bottom:15px;">
                  <tr>
                    <td><strong>Banco:</strong></td>
                    <td>${cuenta.banco?.nombre ?? 'N/D'}</td>
                  </tr>
                  <tr>
                    <td><strong>Número de Cuenta:</strong></td>
                    <td>${cuenta.NumCuenta}</td>
                  </tr>
                  <tr>
                    <td><strong>Saldo Inicial:</strong></td>
                    <td>$${cuenta.saldo}</td>
                  </tr>
                </table>

                <hr>

                <h3 style="margin:15px 0 10px;">💳 Tarjeta</h3>
                <table style="width:100%;">
                  <tr>
                    <td><strong>Número de Tarjeta:</strong></td>
                    <td>${tarjeta.NumTarjeta}</td>
                  </tr>
                  <tr>
                    <td><strong>PIN:</strong></td>
                    <td>${this.usuarioForm.value.pin}</td>
                  </tr>
                  <tr>
                    <td><strong>Rango:</strong></td>
                    <td>${tarjeta.rango?.nombre ?? 'N/D'}</td>
                  </tr>
                  <tr>
                    <td><strong>Retiro Mínimo:</strong></td>
                    <td>$${tarjeta.rango?.minRetiro ?? 0}</td>
                  </tr>
                  <tr>
                    <td><strong>Retiro Máximo:</strong></td>
                    <td>$${tarjeta.rango?.maxRetiro ?? 0}</td>
                  </tr>
                </table>

              </div>
            `,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3085d6',
          });

          this.usuarioForm.reset();

          this.usuarioForm.patchValue({
            saldoInicial: 0,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message || 'No fue posible crear el cliente.',
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
        console.error('Error en la solicitud:', err);

        Swal.close();

        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No fue posible conectar con el servidor. Intente nuevamente más tarde.',
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

  volver(): void {
    this.router.navigate(['/']);
  }
}
