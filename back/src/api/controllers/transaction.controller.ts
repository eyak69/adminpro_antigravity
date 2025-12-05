import { Request, Response } from "express";
import { TransactionService } from "../../application/services/transaction.service";

export class TransactionController {
    constructor(private transactionService: TransactionService) { }

    async ejecutarTransaccion(req: Request, res: Response) {
        try {
            const result = await this.transactionService.procesarTransaccion(req.body);
            res.status(200).json({ ok: true, data: result });
        } catch (error: any) {
            console.error("Transaction Error:", error);
            // Determine status code based on error type if possible, default to 400 for business logic errors
            res.status(400).json({ ok: false, error: error.message });
        }
    }
}
