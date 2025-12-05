import { Request, Response } from "express";
import { StockCajaService } from "../../application/services/stockCaja.service";

const stockCajaService = new StockCajaService();

export class StockCajaController {
    async getAll(req: Request, res: Response) {
        try {
            const stocks = await stockCajaService.getAll();
            res.json(stocks);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener stock de caja", error });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const stock = await stockCajaService.getById(id);
            if (!stock) {
                return res.status(404).json({ message: "Stock de caja no encontrado" });
            }
            res.json(stock);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener stock de caja", error });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const stock = await stockCajaService.create(req.body);
            res.status(201).json(stock);
        } catch (error) {
            res.status(500).json({ message: "Error al crear stock de caja", error });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const stock = await stockCajaService.update(id, req.body);
            if (!stock) {
                return res.status(404).json({ message: "Stock de caja no encontrado" });
            }
            res.json(stock);
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar stock de caja", error });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const success = await stockCajaService.delete(id);
            if (!success) {
                return res.status(404).json({ message: "Stock de caja no encontrado" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar stock de caja", error });
        }
    }
}
