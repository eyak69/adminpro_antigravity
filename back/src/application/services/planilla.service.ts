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
    async getRateEvolution(days: number = 30, monedaId?: number): Promise<any[]> {
        const targetMoneda = monedaId || 1; // Default to USD (ID 1) if not specified

        // Calculate start date (Simple string YYYY-MM-DD)
        const d = new Date();
        d.setDate(d.getDate() - days);
        const startDateStr = d.toISOString().split('T')[0];

        console.log("DEBUG getRateEvolution:", { days, targetMoneda, startDateStr });

        const result = await PlanillaRepository.createQueryBuilder("p")
            .leftJoin("p.moneda_ingreso", "mi")
            .leftJoin("p.moneda_egreso", "me")
            .select("p.fecha_operacion", "fecha")
            // Compra: System receives USD (mi.id = target)
            .addSelect("AVG(CASE WHEN mi.id = :mid THEN p.cotizacion_aplicada ELSE NULL END)", "promedio_compra")
            // Venta: System sells USD (me.id = target)
            .addSelect("AVG(CASE WHEN me.id = :mid THEN p.cotizacion_aplicada ELSE NULL END)", "promedio_venta")
            .where("p.fecha_operacion >= :startDate", { startDate: startDateStr })
            .andWhere("p.cotizacion_aplicada > 0")
            .andWhere(new Brackets(qb => {
                qb.where("mi.id = :mid", { mid: targetMoneda })
                    .orWhere("me.id = :mid", { mid: targetMoneda });
            }))
            .setParameter("mid", targetMoneda)
            .groupBy("p.fecha_operacion")
            .orderBy("p.fecha_operacion", "ASC")
            .getRawMany();

        console.log("DEBUG getRateEvolution RESULT:", result);

        return result.map(r => {
            // Ensure date is string YYYY-MM-DD
            let dateStr = r.fecha;
            if (r.fecha instanceof Date) {
                dateStr = r.fecha.toISOString().split('T')[0];
            } else if (typeof r.fecha === 'string' && r.fecha.includes('T')) {
                dateStr = r.fecha.split('T')[0];
            }

            return {
                fecha: dateStr,
                compra: r.promedio_compra ? Number(Number(r.promedio_compra).toFixed(2)) : null,
                venta: r.promedio_venta ? Number(Number(r.promedio_venta).toFixed(2)) : null
            };
        });
    }

    async getHistoricalBalances(dateInput: string | Date): Promise<any[]> {
        // Fix Date Parsing: "YYYY-MM-DD" is parsed as UTC, shifting to previous day in GMT-3.
        // We manually parse string to ensure we get Local Time End-of-Day.
        let date: Date;
        if (typeof dateInput === 'string' && dateInput.includes('-')) {
            const [y, m, d] = dateInput.split('T')[0].split('-').map(Number);
            date = new Date(y, m - 1, d, 23, 59, 59, 999);
        } else {
            date = new Date(dateInput);
            date.setHours(23, 59, 59, 999);
        }

        console.log("Health Check - Calculating Balance for Date:", date);
        console.log("Input was:", dateInput);

        // 1. Sum Incomes per Currency
        const incomes = await PlanillaRepository.createQueryBuilder("p")
            .leftJoin("p.moneda_ingreso", "mi")
            .select("mi.id", "monedaId")
            .addSelect("SUM(p.monto_ingreso)", "total")
            .where("p.fecha_operacion <= :date", { date })
            .andWhere("(p.impacta_stock = :impacta OR p.impacta_stock IS NULL)", { impacta: true })
            .andWhere("p.moneda_ingreso IS NOT NULL")
            .andWhere("p.deleted_at IS NULL")
            .groupBy("mi.id")
            .getRawMany();

        console.log("Incomes Raw:", incomes);

        // 2. Sum Outcomes per Currency
        const outcomes = await PlanillaRepository.createQueryBuilder("p")
            .leftJoin("p.moneda_egreso", "me")
            .select("me.id", "monedaId")
            .addSelect("SUM(p.monto_egreso)", "total")
            .where("p.fecha_operacion <= :date", { date })
            .andWhere("(p.impacta_stock = :impacta OR p.impacta_stock IS NULL)", { impacta: true })
            .andWhere("p.moneda_egreso IS NOT NULL")
            .andWhere("p.deleted_at IS NULL")
            .groupBy("me.id")
            .getRawMany();

        // 3. Merge and Calculate Net
        const balanceMap = new Map<number, number>();

        incomes.forEach(i => {
            const mid = Number(i.monedaId);
            const val = parseFloat(i.total || '0');
            balanceMap.set(mid, (balanceMap.get(mid) || 0) + val);
        });

        outcomes.forEach(o => {
            const mid = Number(o.monedaId);
            const val = parseFloat(o.total || '0');
            balanceMap.set(mid, (balanceMap.get(mid) || 0) - val);
        });

        // 4. Enrich with Currency Data
        const result = [];
        for (const [monedaId, saldo] of balanceMap.entries()) {
            const moneda = await MonedaRepository.findOneBy({ id: monedaId });
            if (moneda) {
                result.push({
                    moneda: {
                        id: moneda.id,
                        nombre: moneda.nombre,
                        codigo: moneda.codigo,
                        es_nacional: moneda.es_nacional
                    },
                    saldo: Number(saldo.toFixed(2)) // Round to 2 decimals
                });
            }
        }

        return result;
    }

    async getDailyMovements(dateInput: string | Date): Promise<any[]> {
        // Calculate balance ONLY for the specific date (Non-cumulative)
        let dateStart: Date;
        let dateEnd: Date;

        if (typeof dateInput === 'string' && dateInput.includes('-')) {
            const [y, m, d] = dateInput.split('T')[0].split('-').map(Number);
            dateStart = new Date(y, m - 1, d, 0, 0, 0, 0);
            dateEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
        } else {
            const base = new Date(dateInput);
            dateStart = new Date(base);
            dateStart.setHours(0, 0, 0, 0);
            dateEnd = new Date(base);
            dateEnd.setHours(23, 59, 59, 999);
        }

        // 1. Incomes for Day
        const incomes = await PlanillaRepository.createQueryBuilder("p")
            .leftJoin("p.moneda_ingreso", "mi")
            .select("mi.id", "monedaId")
            .addSelect("SUM(p.monto_ingreso)", "total")
            .where("p.fecha_operacion BETWEEN :start AND :end", { start: dateStart, end: dateEnd })
            // .andWhere("(p.impacta_stock = :impacta OR p.impacta_stock IS NULL)", { impacta: true }) // SHOW ALL FOR TEST CARD
            .andWhere("p.moneda_ingreso IS NOT NULL")
            .andWhere("p.deleted_at IS NULL")
            .groupBy("mi.id")
            .getRawMany();

        // 2. Outcomes for Day
        const outcomes = await PlanillaRepository.createQueryBuilder("p")
            .leftJoin("p.moneda_egreso", "me")
            .select("me.id", "monedaId")
            .addSelect("SUM(p.monto_egreso)", "total")
            .where("p.fecha_operacion BETWEEN :start AND :end", { start: dateStart, end: dateEnd })
            // .andWhere("(p.impacta_stock = :impacta OR p.impacta_stock IS NULL)", { impacta: true }) // SHOW ALL FOR TEST CARD
            .andWhere("p.moneda_egreso IS NOT NULL")
            .andWhere("p.deleted_at IS NULL")
            .groupBy("me.id")
            .getRawMany();

        // 3. Merge
        const balanceMap = new Map<number, number>();

        incomes.forEach(i => {
            const mid = Number(i.monedaId);
            const val = parseFloat(i.total || '0');
            balanceMap.set(mid, (balanceMap.get(mid) || 0) + val);
        });

        outcomes.forEach(o => {
            const mid = Number(o.monedaId);
            const val = parseFloat(o.total || '0');
            balanceMap.set(mid, (balanceMap.get(mid) || 0) - val);
        });

        // 4. Enrich
        const result = [];
        for (const [monedaId, saldo] of balanceMap.entries()) {
            const moneda = await MonedaRepository.findOneBy({ id: monedaId });
            if (moneda) {
                result.push({
                    moneda: {
                        id: moneda.id,
                        nombre: moneda.nombre,
                        codigo: moneda.codigo,
                        es_nacional: moneda.es_nacional
                    },
                    saldo: Number(saldo.toFixed(2))
                });
            }
        }

        return result;
    }
}
