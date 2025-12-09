import { CtaCteRepository } from "../../infrastructure/repositories/ctaCte.repository";
import { ClienteRepository } from "../../infrastructure/repositories/cliente.repository";
import { MonedaRepository } from "../../infrastructure/repositories/moneda.repository";
import { TipoMovimientoCtaCte } from "../../domain/enums/TipoMovimientoCtaCte";

export class CtaCteService {
    async getSaldo(clienteId: number, monedaId: number): Promise<number> {
        return await CtaCteRepository.getSaldo(clienteId, monedaId);
    }

    async getMovimientos(clienteId: number): Promise<any[]> {
        return await CtaCteRepository.getMovimientos(clienteId);
    }

    async getSaldosVip(): Promise<any[]> {
        return await CtaCteRepository.getSaldosVip();
    }

    /*
    async registrarMovimiento(data: any): Promise<void> {
        const cliente = await ClienteRepository.findOneBy({ id: data.clienteId });
        if (!cliente) throw new Error("Cliente not found");

        const moneda = await MonedaRepository.findOneBy({ id: data.monedaId });
        if (!moneda) throw new Error("Moneda not found");

        await CtaCteRepository.registrarMovimiento({
            fecha_operacion: data.fecha_operacion || new Date(),
            tipo: data.tipo as TipoMovimientoCtaCte,
            cliente: cliente,
            moneda: moneda,
            monto: data.monto,
            cotizacion_aplicada: data.cotizacion_aplicada,
            observaciones: data.observaciones,
            planilla_asociada: null // For manual movements via API, this is null
        });
    }
    */
}
