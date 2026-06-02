import { Banco } from "./banco";
import { Usuario } from "./usuario";

export interface Cuenta {

    idCuenta: number;
    usuario: Usuario;
    banco?: Banco;
    NumCuenta: number;
    saldo: number;
    
}
