import { Request, Response } from "express";
import { PlanillaService } from "../../application/services/planilla.service";

const planillaService = new PlanillaService();

export class PlanillaController {
    async getAll(req: Request, res: Response) {
        try {
            const planillas = await planillaService.getAll(req.query);
            res.json(planillas);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener planilla", error });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const planilla = await planillaService.getById(id);
            if (!planilla) {
                return res.status(404).json({ message: "Registro de planilla no encontrado" });
            }
            res.json(planilla);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener registro de planilla", error });
        }
    }

    // POST create removed to enforce TransactionService usage
    // async create(req: Request, res: Response) { ... }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const planilla = await planillaService.update(id, req.body);
            if (!planilla) {
                return res.status(404).json({ message: "Registro de planilla no encontrado" });
            }
            res.json(planilla);
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar registro de planilla", error });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const success = await planillaService.delete(id);
            if (!success) {
                return res.status(404).json({ message: "Registro de planilla no encontrado" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar registro de planilla", error });
        }
    }

    async getLastCotizacion(req: Request, res: Response) {
        try {
            const monedaId = parseInt(req.params.monedaId);
            const tipoAccion = req.query.accion as string | undefined;
            const cotizacion = await planillaService.getLastCotizacion(monedaId, tipoAccion);
            res.json({ cotizacion });
        } catch (error) {
            res.status(500).json({ message: "Error getting last cotizacion", error });
        }
    }
    async getRates(req: Request, res: Response) {
        try {
            const days = req.query.days ? parseInt(req.query.days as string) : 30;
            const monedaId = req.query.monedaId ? parseInt(req.query.monedaId as string) : undefined;
            const rates = await planillaService.getRateEvolution(days, monedaId);
            res.json(rates);
        } catch (error) {
            res.status(500).json({ message: "Error getting rates", error });
        }
    }

    async getBalance(req: Request, res: Response) {
        try {
            const dateStr = req.query.date as string;
            if (!dateStr) {
                return res.status(400).json({ message: "Date query param is required" });
            }
            const balances = await planillaService.getHistoricalBalances(dateStr);
            res.json(balances);
        } catch (error) {
            res.status(500).json({ message: "Error getting historical balance", error });
        }
    }
    async getDayBalance(req: Request, res: Response) {
        try {
            const dateStr = req.query.date as string;
            if (!dateStr) {
                return res.status(400).json({ message: "Date query param is required" });
            }
            const balances = await planillaService.getDailyMovements(dateStr);
            res.json(balances);
        } catch (error) {
            res.status(500).json({ message: "Error getting daily movements", error });
        }
    }
}
