import { Request, Response } from "express";
import { AiService } from "../../application/services/ai.service";

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
}
