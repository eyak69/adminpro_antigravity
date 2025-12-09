import { AppDataSource } from "../database/data-source";
import { Raw } from "typeorm";
import { CtaCteMovimiento } from "../../domain/entities/CtaCteMovimiento";
import { CtaCteSaldo } from "../../domain/entities/CtaCteSaldo";
import { TipoMovimientoCtaCte } from "../../domain/enums/TipoMovimientoCtaCte";
import { Cliente } from "../../domain/entities/Cliente";
import { Moneda } from "../../domain/entities/Moneda";

export const CtaCteRepository = AppDataSource.getRepository(CtaCteMovimiento).extend({
    async getSaldo(clienteId: number, monedaId: number): Promise<number> {
        const saldoEntity = await AppDataSource.getRepository(CtaCteSaldo).findOne({
            where: { cliente: { id: clienteId }, moneda: { id: monedaId } },
        });
        return saldoEntity ? Number(saldoEntity.saldo_actual) : 0;
    },

    async registrarMovimiento(movimientoData: Partial<CtaCteMovimiento>): Promise<void> {
        await AppDataSource.transaction(async (transactionalEntityManager) => {
            // 1. Save Movimiento
            const movimiento = transactionalEntityManager.create(CtaCteMovimiento, movimientoData);
            await transactionalEntityManager.save(movimiento);

            // 2. Update Saldo
            const saldoRepo = transactionalEntityManager.getRepository(CtaCteSaldo);
            let saldoEntity = await saldoRepo.findOne({
                where: {
                    cliente: { id: movimientoData.cliente!.id },
                    moneda: { id: movimientoData.moneda!.id }
                },
            });

            if (!saldoEntity) {
                saldoEntity = saldoRepo.create({
                    cliente: movimientoData.cliente,
                    moneda: movimientoData.moneda,
                    saldo_actual: 0,
                });
            }

            // Logic: Ingreso (Entra a CtaCte/Deuda) increases Saldo. Egreso (Sale de CtaCte/Pago) decreases Saldo.
            const egreso = Number(movimientoData.monto_egreso || 0);
            const ingreso = Number(movimientoData.monto_ingreso || 0);

            saldoEntity.saldo_actual = Number(saldoEntity.saldo_actual) + ingreso - egreso;

            await saldoRepo.save(saldoEntity);
        });
    },

    async getMovimientos(clienteId: number): Promise<CtaCteMovimiento[]> {
        return this.find({
            where: { cliente: { id: clienteId } },
            relations: ["cliente", "moneda", "planilla_asociada"],
            order: { fecha_operacion: "DESC" }
        });
    },

    async getSaldosVip(): Promise<CtaCteSaldo[]> {
        return await AppDataSource.getRepository(CtaCteSaldo).find({
            where: {
                cliente: { es_vip: true },
                saldo_actual: Raw(alias => `${alias} != 0`)
            },
            relations: ["cliente", "moneda"],
            order: { cliente: { alias: "ASC" } }
        });
    }
});
