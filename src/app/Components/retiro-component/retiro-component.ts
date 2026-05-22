import { Component, OnInit } from '@angular/core';
import { RetiroService } from '../../Services/retiro-service';
import { Retiro } from '../../Interfaces/retiro';
import { Transaccion } from '../../Interfaces/transaccion';
import { Tarjeta } from '../../Interfaces/tarjeta';

@Component({
  selector: 'app-retiro-component',
  imports: [],
  templateUrl: './retiro-component.html',
  styleUrl: './retiro-component.css',
})
export class RetiroComponent implements OnInit {
  constructor(private retiroService: RetiroService) {}

  ngOnInit() {
    this.retiroService.transact(this.transaccion).subscribe({
      next: (result)=>{
        if(result.correct){
          console.log(result.objects)
        }
      },
      error: (err)=>{
        console.warn(err)
      }
    })
  }
  transaccion: Transaccion = {
    monto: 674.5,
    cajero: {
      idCajero: 21,
    },
    tarjeta: {
      idTarjeta: 2,
      NumTarjeta: '1234567812345678',
      pin: '1234',
      status: 1,
    },
  };
}
