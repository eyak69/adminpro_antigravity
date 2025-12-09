import { Router } from "express";
import monedaRoutes from "./moneda.routes";
import stockCajaRoutes from "./stockCaja.routes";
import clienteRoutes from "./cliente.routes";
import operacionRoutes from "./operacion.routes";
import tipoMovimientoRoutes from "./tipoMovimiento.routes";
import planillaRoutes from "./planilla.routes";
import ctaCteRoutes from "./ctaCte.routes";
import { createTransactionRouter } from "./transaction.routes";
import { TransactionController } from "../controllers/transaction.controller";
import { TransactionService } from "../../application/services/transaction.service";
import logRoutes from "./log.routes";
import aiRoutes from "./ai.routes";

import fs from 'fs';
import path from 'path';

const router = Router();
router.get("/ping-top", (req, res) => res.json({ message: "pong-top" }));
const transactionService = new TransactionService();
const transactionController = new TransactionController(transactionService);
const transactionRoutes = createTransactionRouter(transactionController);

import { parametroRoutes } from "./parametro.routes";


router.use("/monedas", monedaRoutes);
router.use("/stock-caja", stockCajaRoutes);
router.use("/clientes", clienteRoutes);
router.use("/operaciones", operacionRoutes);
router.use("/tipos-movimiento", tipoMovimientoRoutes);
router.use("/planillas", planillaRoutes);
router.use("/cta-cte", ctaCteRoutes);
router.use("/transactions", transactionRoutes);
router.use("/logs", logRoutes);
router.use("/parametros", parametroRoutes);
router.use("/ai", aiRoutes);


try {
    const stackFile = path.join(process.cwd(), 'logs', 'routes.log');
    const routes = router.stack
        .filter((r: any) => r.route)
        .map((r: any) => r.route.path);
    fs.writeFileSync(stackFile, JSON.stringify(routes, null, 2));
} catch (e) {
    console.error("Failed to dump routes", e);
}

// DB Migration Restart
export default router;
