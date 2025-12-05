import { Request, Response } from 'express';
import LogService from '../../application/services/log.service';

export const createLog = async (req: Request, res: Response) => {
    try {
        const { type, message } = req.body;
        if (!message) {
            res.status(400).json({ message: 'Message is required' });
            return;
        }
        await LogService.log({ type: type || 'info', message });
        res.status(201).json({ message: 'Log created' });
    } catch (error) {
        console.error('Error creating log:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getLogs = async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const logs = await LogService.getRecentLogs(limit);
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        // Fail safe: return empty array instead of 500 so frontend doesn't crash
        res.json([]);
    }
};
