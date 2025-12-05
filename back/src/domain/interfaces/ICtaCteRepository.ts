import { CtaCteMovimiento } from "../entities/CtaCteMovimiento";

export interface ICtaCteRepository {
    getSaldo(clienteId: number, monedaId: number): Promise<number>;
    registrarMovimiento(movimiento: Partial<CtaCteMovimiento>): Promise<void>;
}
