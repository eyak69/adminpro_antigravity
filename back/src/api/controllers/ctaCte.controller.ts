import { Request, Response } from "express";
import { CtaCteService } from "../../application/services/ctaCte.service";

const ctaCteService = new CtaCteService();

export class CtaCteController {
    async getSaldo(req: Request, res: Response) {
        try {
            const clienteId = parseInt(req.params.clienteId);
            const monedaId = parseInt(req.params.monedaId);
            const saldo = await ctaCteService.getSaldo(clienteId, monedaId);
            res.json({ saldo });
        } catch (error) {
            res.status(500).json({ message: "Error al obtener saldo", error });
        }
    }

    async getMovimientos(req: Request, res: Response) {
        try {
            const clienteId = parseInt(req.params.clienteId);
            const movimientos = await ctaCteService.getMovimientos(clienteId);
            res.json(movimientos);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener movimientos", error });
        }
    }

    // POST registrarMovimiento removed to enforce TransactionService usage
    // async registrarMovimiento(req: Request, res: Response) { ... }
}
