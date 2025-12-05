import { Request, Response } from "express";
import { PlanillaService } from "../../application/services/planilla.service";

const planillaService = new PlanillaService();

export class PlanillaController {
    async getAll(req: Request, res: Response) {
        try {
            const planillas = await planillaService.getAll();
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
}
