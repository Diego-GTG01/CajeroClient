import { Routes } from '@angular/router';
import { RetiroComponent } from './Components/retiro-component/retiro-component';
import { VistaMain } from './Components/vista-main/vista-main';
import { VistaLogin } from './Components/vista-login/vista-login';
import { VistaUsuario } from './Components/vista-usuario/vista-usuario';

export const routes: Routes = [
  { path: '',
     component: VistaMain },
  {
    path: 'retiro',
    component: RetiroComponent,
  },{
    path: 'login',
    component: VistaLogin
  },
  {
    path: 'users',
    component: VistaUsuario
  }
];
