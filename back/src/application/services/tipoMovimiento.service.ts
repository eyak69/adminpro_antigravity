import { TipoMovimientoRepository } from "../../infrastructure/repositories/tipoMovimiento.repository";
import { TipoMovimiento } from "../../domain/entities/TipoMovimiento";
import { OperacionRepository } from "../../infrastructure/repositories/operacion.repository";
import { MonedaRepository } from "../../infrastructure/repositories/moneda.repository";
import { In } from "typeorm";

export class TipoMovimientoService {
    async getAll(): Promise<TipoMovimiento[]> {
        return await TipoMovimientoRepository.find({
            relations: ["operacion", "monedas_permitidas"],
        });
    }

    async getById(id: number): Promise<TipoMovimiento | null> {
        return await TipoMovimientoRepository.findByIdWithMonedas(id);
    }

    async create(data: Partial<TipoMovimiento> & { operacionId: number; monedaIds?: number[] }): Promise<TipoMovimiento> {
        const operacion = await OperacionRepository.findById(data.operacionId);
        if (!operacion) {
            throw new Error("Operacion not found");
        }

        let monedas: any[] = [];
        if (data.monedaIds && data.monedaIds.length > 0) {
            monedas = await MonedaRepository.findBy({ id: In(data.monedaIds) });
        }

        const tipoMovimiento = TipoMovimientoRepository.create({
            ...data,
            operacion,
            monedas_permitidas: monedas,
        });

        return await TipoMovimientoRepository.save(tipoMovimiento);
    }

    async update(id: number, data: Partial<TipoMovimiento> & { operacionId?: number; monedaIds?: number[] }): Promise<TipoMovimiento | null> {
        const tipoMovimiento = await this.getById(id);
        if (!tipoMovimiento) return null;

        if (data.operacionId) {
            const operacion = await OperacionRepository.findById(data.operacionId);
            if (operacion) {
                tipoMovimiento.operacion = operacion;
            }
        }

        if (data.monedaIds) {
            const monedas = await MonedaRepository.findBy({ id: In(data.monedaIds) });
            tipoMovimiento.monedas_permitidas = monedas;
        }

        TipoMovimientoRepository.merge(tipoMovimiento, data);
        return await TipoMovimientoRepository.save(tipoMovimiento);
    }

    async delete(id: number): Promise<boolean> {
        const result = await TipoMovimientoRepository.softDelete(id);
        return result.affected !== 0;
    }
}
