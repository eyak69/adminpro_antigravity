import { Request, Response } from 'express';
import ParametroService from '../../application/services/parametro.service';

export const getParametro = async (req: Request, res: Response) => {
    try {
        const { clave } = req.params;
        const valor = await ParametroService.get(clave);
        if (!valor) {
            res.status(404).json({ message: 'Parámetro no encontrado' });
            return;
        }
        res.json(valor);
    } catch (error) {
        console.error('Error fetching parametro:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateParametro = async (req: Request, res: Response) => {
    try {
        const { clave } = req.params;
        const { valor, descripcion } = req.body; // valor can be object or string
        const updated = await ParametroService.set(clave, valor, descripcion);
        res.json(updated);
    } catch (error) {
        console.error('Error updating parametro:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllParametros = async (req: Request, res: Response) => {
    try {
        const parametros = await ParametroService.getAll();
        res.json(parametros);
    } catch (error) {
        console.error('Error fetching all parametros:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createParametro = async (req: Request, res: Response) => {
    try {
        const { clave, valor, descripcion } = req.body;
        if (!clave || !valor) {
            res.status(400).json({ message: 'Clave and Valor are required' });
            return;
        }
        const created = await ParametroService.set(clave, valor, descripcion);
        res.json(created);
    } catch (error) {
        console.error('Error creating parametro:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteParametro = async (req: Request, res: Response) => {
    try {
        const { clave } = req.params;
        await ParametroService.delete(clave);
        res.json({ message: 'Parametro deleted successfully' });
    } catch (error) {
        console.error('Error deleting parametro:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
