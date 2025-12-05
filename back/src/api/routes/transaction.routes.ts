import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";

export const createTransactionRouter = (controller: TransactionController): Router => {
    const router = Router();

    router.post("/", (req, res) => controller.ejecutarTransaccion(req, res));

    return router;
};
