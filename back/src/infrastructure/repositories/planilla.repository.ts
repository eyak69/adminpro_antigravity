import { AppDataSource } from "../database/data-source";
import { PlanillaDiaria } from "../../domain/entities/PlanillaDiaria";
import { IPlanillaRepository } from "../../domain/interfaces/IPlanillaRepository";
import { Between } from "typeorm";

export const PlanillaRepository = AppDataSource.getRepository(PlanillaDiaria).extend({
    async createTransaction(transaccion: Partial<PlanillaDiaria>): Promise<PlanillaDiaria> {
        const nuevaTransaccion = this.create(transaccion);
        return await this.save(nuevaTransaccion);
    },

    async findByDateRange(start: Date, end: Date): Promise<PlanillaDiaria[]> {
        return this.find({
            where: {
                fecha_operacion: Between(start, end),
            },
            relations: ["tipo_movimiento", "cliente", "moneda_ingreso", "moneda_egreso"],
            order: { fecha_operacion: "DESC" },
        });
    },

    async findByCliente(clienteId: number): Promise<PlanillaDiaria[]> {
        return this.find({
            where: { cliente: { id: clienteId } },
            relations: ["tipo_movimiento", "cliente", "moneda_ingreso", "moneda_egreso"],
            order: { fecha_operacion: "DESC" },
        });
    },
});
