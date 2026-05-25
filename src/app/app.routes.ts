import { Routes } from '@angular/router';
import { RetiroComponent } from './Components/retiro-component/retiro-component';
import { VistaMain } from './Components/vista-main/vista-main';

export const routes: Routes = [
  { path: '', component: VistaMain },
  {
    path: 'retiro',
    component: RetiroComponent,
  },
];
