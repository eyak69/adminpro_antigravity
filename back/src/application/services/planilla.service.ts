import { PlanillaRepository } from "../../infrastructure/repositories/planilla.repository";
import { PlanillaDiaria } from "../../domain/entities/PlanillaDiaria";
import { TipoMovimientoRepository } from "../../infrastructure/repositories/tipoMovimiento.repository";
import { ClienteRepository } from "../../infrastructure/repositories/cliente.repository";
import { MonedaRepository } from "../../infrastructure/repositories/moneda.repository";
import { Raw, Brackets } from "typeorm";


export class PlanillaService {
    async getAll(filters?: any): Promise<PlanillaDiaria[]> {
        const where: any = {};

        if (filters?.fecha) {
            // Force strict SQL DATE comparison: CAST(col AS DATE) = 'YYYY-MM-DD'
            // This handles cases where col might still be DATETIME in reality, or Driver weirdness.
            where.fecha_operacion = Raw((alias) => `CAST(${alias} AS DATE) = :date`, { date: filters.fecha });
        }

        return await PlanillaRepository.find({
            where,
            relations: ["tipo_movimiento", "cliente", "moneda_ingreso", "moneda_egreso"],
            order: { id: "ASC" },
        });
    }

    async getById(id: number): Promise<PlanillaDiaria | null> {
        return await PlanillaRepository.findOne({
            where: { id },
            relations: ["tipo_movimiento", "cliente", "moneda_ingreso", "moneda_egreso"],
        });
    }

    async update(id: number, data: any): Promise<PlanillaDiaria | null> {
        const planilla = await this.getById(id);
        if (!planilla) return null;

        if (data.observaciones !== undefined) planilla.observaciones = data.observaciones;
        if (data.fecha_operacion !== undefined) planilla.fecha_operacion = data.fecha_operacion;
        if (data.cliente) planilla.cliente = data.cliente;

        return await PlanillaRepository.save(planilla);
    }

    async delete(id: number): Promise<boolean> {
        const transactionService = new (require("./transaction.service").TransactionService)();
        try {
            await transactionService.anularTransaccion(id);
            return true;
        } catch (error) {
            console.error("Error anulling transaction:", error);
            return false;
        }
    }

    async getLastCotizacion(monedaId: number, tipoAccion?: string): Promise<number> {
        // Construct the relation filter for tipo_movimiento if action is provided
        const tipoMovFilter = tipoAccion ? { tipo_accion: tipoAccion as any } : undefined;

        const lastOp = await PlanillaRepository.findOne({
            where: [
                {
                    moneda_ingreso: { id: monedaId },
                    cotizacion_aplicada: Raw(alias => `${alias} IS NOT NULL AND ${alias} > 0`),
                    ...(tipoMovFilter ? { tipo_movimiento: tipoMovFilter } : {})
                },
                {
                    moneda_egreso: { id: monedaId },
                    cotizacion_aplicada: Raw(alias => `${alias} IS NOT NULL AND ${alias} > 0`),
                    ...(tipoMovFilter ? { tipo_movimiento: tipoMovFilter } : {})
                }
            ],
            order: { fecha_operacion: "DESC", id: "DESC" },
            relations: ["tipo_movimiento"]
        });

        return lastOp?.cotizacion_aplicada || 0;
    }
}
