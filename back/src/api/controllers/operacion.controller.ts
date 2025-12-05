import { Request, Response } from "express";
import { OperacionService } from "../../application/services/operacion.service";

const operacionService = new OperacionService();

export class OperacionController {
    async getAll(req: Request, res: Response) {
        try {
            const operaciones = await operacionService.getAll();
            res.json(operaciones);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener operaciones", error });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const operacion = await operacionService.getById(id);
            if (!operacion) {
                return res.status(404).json({ message: "Operación no encontrada" });
            }
            res.json(operacion);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener operación", error });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const operacion = await operacionService.create(req.body);
            res.status(201).json(operacion);
        } catch (error) {
            res.status(500).json({ message: "Error al crear operación", error });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const operacion = await operacionService.update(id, req.body);
            if (!operacion) {
                return res.status(404).json({ message: "Operación no encontrada" });
            }
            res.json(operacion);
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar operación", error });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const success = await operacionService.delete(id);
            if (!success) {
                return res.status(404).json({ message: "Operación no encontrada" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar operación", error });
        }
    }
}
