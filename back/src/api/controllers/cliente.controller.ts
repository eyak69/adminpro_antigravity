import { Request, Response } from "express";
import { ClienteService } from "../../application/services/cliente.service";

const clienteService = new ClienteService();

export class ClienteController {
    async getAll(req: Request, res: Response) {
        try {
            const clientes = await clienteService.getAll();
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener clientes", error });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const cliente = await clienteService.getById(id);
            if (!cliente) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener cliente", error });
        }
    }

    async getByAlias(req: Request, res: Response) {
        try {
            const alias = req.params.alias;
            const cliente = await clienteService.getByAlias(alias);
            if (!cliente) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener cliente", error });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const cliente = await clienteService.create(req.body);
            res.status(201).json(cliente);
        } catch (error) {
            res.status(500).json({ message: "Error al crear cliente", error });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const cliente = await clienteService.update(id, req.body);
            if (!cliente) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ message: "Error al actualizar cliente", error });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const success = await clienteService.delete(id);
            if (!success) {
                return res.status(404).json({ message: "Cliente no encontrado" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Error al eliminar cliente", error });
        }
    }
}
