import { Cuenta } from "./cuenta";
import { Tarjeta } from "./tarjeta";
import { Usuario } from "./usuario";

export interface CreateClienteRequest {
     usuario: Usuario;
     cuenta: Cuenta;
     tarjeta: Tarjeta;
}
