import { Banco } from "./banco";
import { Rango } from "./rango";

export interface Tarjeta {
    idTarjeta: number;
    rango?: Rango;
    banco?: Banco;
    NumTarjeta: string;
    pin: string;
    fechaVencimiento?: Date;
    status?: number;
    
    

}
