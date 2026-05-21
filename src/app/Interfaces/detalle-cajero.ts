import { Cajero } from "./cajero";
import { Denominacion } from "./denominacion";

export interface DetalleCajero {
    idDetalleCajero: number;
    cajero: Cajero;
    denominacion: Denominacion;
    cantidad: number;
}
