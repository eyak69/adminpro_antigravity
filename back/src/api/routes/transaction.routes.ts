import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";

export const createTransactionRouter = (controller: TransactionController): Router => {
    const router = Router();

    router.post("/", (req, res) => controller.ejecutarTransaccion(req, res));
    router.post("/anular/:id", (req, res) => controller.anularTransaccion(req, res));

    return router;
};
