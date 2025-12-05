import { PlanillaRepository } from "../../infrastructure/repositories/planilla.repository";
import { PlanillaDiaria } from "../../domain/entities/PlanillaDiaria";
import { TipoMovimientoRepository } from "../../infrastructure/repositories/tipoMovimiento.repository";
import { ClienteRepository } from "../../infrastructure/repositories/cliente.repository";
import { MonedaRepository } from "../../infrastructure/repositories/moneda.repository";

export class PlanillaService {
    async getAll(): Promise<PlanillaDiaria[]> {
        return await PlanillaRepository.find({
            relations: ["tipo_movimiento", "cliente", "moneda_ingreso", "moneda_egreso"],
            order: { fecha_operacion: "DESC" },
        });
    }

    async getById(id: number): Promise<PlanillaDiaria | null> {
        return await PlanillaRepository.findOne({
            where: { id },
            relations: ["tipo_movimiento", "cliente", "moneda_ingreso", "moneda_egreso"],
        });
    }

    /*
    async create(data: any): Promise<PlanillaDiaria> {
        // Validate TipoMovimiento
        const tipoMovimiento = await TipoMovimientoRepository.findOneBy({ id: data.tipoMovimientoId });
        if (!tipoMovimiento) throw new Error("TipoMovimiento not found");

        // Validate Cliente if required
        let cliente = null;
        if (data.clienteId) {
            cliente = await ClienteRepository.findOneBy({ id: data.clienteId });
            if (!cliente) throw new Error("Cliente not found");
        } else if (tipoMovimiento.es_persona_obligatoria) {
            throw new Error("Cliente is mandatory for this transaction type");
        }

        // Validate Monedas
        let monedaIngreso = null;
        if (data.monedaIngresoId) {
            monedaIngreso = await MonedaRepository.findOneBy({ id: data.monedaIngresoId });
            if (!monedaIngreso) throw new Error("Moneda Ingreso not found");
        }

        let monedaEgreso = null;
        if (data.monedaEgresoId) {
            monedaEgreso = await MonedaRepository.findOneBy({ id: data.monedaEgresoId });
            if (!monedaEgreso) throw new Error("Moneda Egreso not found");
        }

        const planilla = PlanillaRepository.create({
            fecha_operacion: data.fecha_operacion || new Date(),
            tipo_movimiento: tipoMovimiento,
            cliente: cliente,
            moneda_ingreso: monedaIngreso,
            monto_ingreso: data.monto_ingreso || 0,
            moneda_egreso: monedaEgreso,
            monto_egreso: data.monto_egreso || 0,
            cotizacion_aplicada: data.cotizacion_aplicada || 1,
            observaciones: data.observaciones,
        });

        return await PlanillaRepository.save(planilla);
    }
    */

    async update(id: number, data: any): Promise<PlanillaDiaria | null> {
        const planilla = await this.getById(id);
        if (!planilla) return null;

        // Update logic could be complex due to relations, keeping it simple for now
        // In a real app, we might want to re-validate rules if type changes

        if (data.observaciones !== undefined) planilla.observaciones = data.observaciones;
        // ... map other fields carefully

        return await PlanillaRepository.save(planilla);
    }

    async delete(id: number): Promise<boolean> {
        // Use TransactionService to ensure full reversal
        const transactionService = new (require("./transaction.service").TransactionService)();
        try {
            await transactionService.anularTransaccion(id);
            return true;
        } catch (error) {
            console.error("Error anulling transaction:", error);
            return false;
        }
    }
}
