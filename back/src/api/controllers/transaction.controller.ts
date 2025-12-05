import { Request, Response } from "express";
import { TransactionService } from "../../application/services/transaction.service";
import LogService from "../../application/services/log.service";

export class TransactionController {
    constructor(private transactionService: TransactionService) { }

    async ejecutarTransaccion(req: Request, res: Response) {
        try {
            const result = await this.transactionService.procesarTransaccion(req.body);

            // Log success
            const monto = result.monto_ingreso || result.monto_egreso;
            const moneda = (result.moneda_ingreso || result.moneda_egreso)?.codigo || '';
            const tipo = result.tipo_movimiento?.nombre || 'Operación';
            await LogService.log({
                type: 'success',
                message: `Nueva Operación: ${tipo} - ${moneda} ${monto} (ID: ${result.id})`
            });

            res.status(200).json({ ok: true, data: result });
        } catch (error: any) {
            console.error("Transaction Error:", error);

            // Log error
            await LogService.log({
                type: 'error',
                message: `Error en Operación: ${error.message}`
            });

            res.status(400).json({ ok: false, error: error.message });
        }
    }

    async anularTransaccion(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            if (!id) {
                return res.status(400).json({ ok: false, error: "ID de transacción es obligatorio" });
            }
            await this.transactionService.anularTransaccion(id);

            // Log success
            await LogService.log({
                type: 'warning',
                message: `Operación Anulada (ID: ${id})`
            });

            res.status(200).json({ ok: true, message: "Transacción anulada correctamente" });
        } catch (error: any) {
            console.error("Transaction Error:", error);

            // Log error
            await LogService.log({
                type: 'error',
                message: `Error al Anular (ID: ${req.params.id}): ${error.message}`
            });

            res.status(400).json({ ok: false, error: error.message });
        }
    }
}
