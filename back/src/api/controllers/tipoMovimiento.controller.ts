import { Request, Response } from "express";
import { TipoMovimientoService } from "../../application/services/tipoMovimiento.service";

const tipoMovimientoService = new TipoMovimientoService();

export class TipoMovimientoController {
    async getAll(req: Request, res: Response) {
        try {
            const tipos = await tipoMovimientoService.getAll();
            res.json(tipos);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener tipos de movimiento", error });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const tipo = await tipoMovimientoService.getById(id);
            if (!tipo) {
                return res.status(404).json({ message: "Tipo de movimiento no encontrado" });
            }
            res.json(tipo);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener tipo de movimiento", error });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const tipo = await tipoMovimientoService.create(req.body);
            res.status(201).json(tipo);
        } catch (error: any) {
            res.status(500).json({ message: "Error al crear tipo de movimiento", error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const tipo = await tipoMovimientoService.update(id, req.body);
            if (!tipo) {
                return res.status(404).json({ message: "Tipo de movimiento no encontrado" });
            }
            res.json(tipo);
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar tipo de movimiento", error });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const success = await tipoMovimientoService.delete(id);
            if (!success) {
                return res.status(404).json({ message: "Tipo de movimiento no encontrado" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar tipo de movimiento", error });
        }
    }
}
