import { Request, Response } from "express";
import { AiService } from "../../application/services/ai.service";
import { AppDataSource } from "../../infrastructure/database/data-source";
import { Operacion } from "../../domain/entities/Operacion";
import { TipoMovimiento } from "../../domain/entities/TipoMovimiento";

const aiService = new AiService();

export class AiController {
    async parse(req: Request, res: Response) {
        try {
            const { text } = req.body;
            if (!text) {
                return res.status(400).json({ message: "Text is required" });
            }

            const result = await aiService.parseTransaction(text);
            res.json(result);
        } catch (error) {
            console.error("AI Parse Error:", error);
            res.status(500).json({ message: "Error parsing transaction", error: error instanceof Error ? error.message : error });
        }
    }

    async analyze(req: Request, res: Response) {
        try {
            const data = req.body; // { monedaId, cotizacion, ... }
            const result = await aiService.analyzeAnomaly(data);
            res.json(result);
        } catch (error) {
            console.error("AI Analyze Error:", error);
            res.status(500).json({ message: "Error analyzing anomaly", error: error instanceof Error ? error.message : error });
        }
    }
    async classify(req: Request, res: Response) {
        try {
            const { text } = req.body;
            if (!text) return res.status(400).json({ message: "Text is required" });

            // Fetch Context on demand to keep it fresh
            const operaciones = await AppDataSource.getRepository(Operacion).find({ select: ["id", "nombre"] });
            const tipos = await AppDataSource.getRepository(TipoMovimiento).find({
                select: ["id", "nombre"],
                relations: ["operacion"]
            });

            const result = await aiService.classifyTransaction(text, { operaciones, tipos });
            res.json(result);
        } catch (error) {
            console.error("AI Classify Error:", error);
            res.status(500).json({ message: "Error classifying transaction" });
        }
    }
}
