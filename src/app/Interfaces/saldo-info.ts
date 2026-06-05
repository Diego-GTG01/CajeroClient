// Response de GET /usuario/saldo/{numTarjeta}
export interface SaldoInfo {
  idUsuario: number;
  numTarjeta: string;
  numCuenta: string;
  saldo: number;
  nombreUsuario: string;
  banco: string;
  rango: string;
}