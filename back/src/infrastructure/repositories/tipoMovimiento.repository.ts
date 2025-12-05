import { AppDataSource } from "../database/data-source";
import { TipoMovimiento } from "../../domain/entities/TipoMovimiento";
import { ITipoMovimientoRepository } from "../../domain/interfaces/ITipoMovimientoRepository";

export const TipoMovimientoRepository = AppDataSource.getRepository(TipoMovimiento).extend({
    async findByIdWithMonedas(id: number): Promise<TipoMovimiento | null> {
        return this.findOne({
            where: { id },
            relations: ["monedas_permitidas", "operacion"],
        });
    },
    async findAllByOperacion(operacionId: number): Promise<TipoMovimiento[]> {
        return this.find({
            where: { operacion: { id: operacionId } },
            relations: ["monedas_permitidas", "operacion"],
        });
    },
});
