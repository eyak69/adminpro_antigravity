import { Router } from "express";
import { CtaCteController } from "../controllers/ctaCte.controller";

const router = Router();
const ctaCteController = new CtaCteController();

router.get("/saldos-vip", ctaCteController.getSaldosVip);
router.get("/saldo/:clienteId/:monedaId", ctaCteController.getSaldo);
router.get("/movimientos/:clienteId", ctaCteController.getMovimientos);

export default router;
