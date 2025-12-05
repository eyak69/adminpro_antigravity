import { Request, Response } from "express";
import { MonedaService } from "../../application/services/moneda.service";

const monedaService = new MonedaService();

export class MonedaController {
    async getAll(req: Request, res: Response) {
        try {
            const monedas = await monedaService.getAll();
            res.json(monedas);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener monedas", error });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const moneda = await monedaService.getById(id);
            if (!moneda) {
                return res.status(404).json({ message: "Moneda no encontrada" });
            }
            res.json(moneda);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener moneda", error });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const moneda = await monedaService.create(req.body);
            res.status(201).json(moneda);
        } catch (error) {
            res.status(500).json({ message: "Error al crear moneda", error });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const moneda = await monedaService.update(id, req.body);
            if (!moneda) {
                return res.status(404).json({ message: "Moneda no encontrada" });
            }
            res.json(moneda);
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar moneda", error });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const success = await monedaService.delete(id);
            if (!success) {
                return res.status(404).json({ message: "Moneda no encontrada" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar moneda", error });
        }
    }
}
