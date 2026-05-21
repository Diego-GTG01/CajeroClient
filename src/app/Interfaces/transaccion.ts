import { Cajero } from "./cajero";
import { Tarjeta } from "./tarjeta";

export interface Transaccion {
    idTransaccion: number;
    tarjeta: Tarjeta;
    cajero: Cajero;
    monto: number;
    fecha: Date;
    estado: number;
}
