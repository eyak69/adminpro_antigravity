import { TipoMovimiento } from "../entities/TipoMovimiento";

export interface ITipoMovimientoRepository {
    findByIdWithMonedas(id: number): Promise<TipoMovimiento | null>;
    findAllByOperacion(operacionId: number): Promise<TipoMovimiento[]>;
}
