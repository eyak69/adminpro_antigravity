import { Router } from "express";
import monedaRoutes from "./moneda.routes";
import stockCajaRoutes from "./stockCaja.routes";
import clienteRoutes from "./cliente.routes";
import operacionRoutes from "./operacion.routes";
import tipoMovimientoRoutes from "./tipoMovimiento.routes";
import planillaRoutes from "./planilla.routes";
import ctaCteRoutes from "./ctaCte.routes";

const router = Router();

router.use("/monedas", monedaRoutes);
router.use("/stock-caja", stockCajaRoutes);
router.use("/clientes", clienteRoutes);
router.use("/operaciones", operacionRoutes);
router.use("/tipos-movimiento", tipoMovimientoRoutes);
router.use("/planilla", planillaRoutes);
router.use("/cta-cte", ctaCteRoutes);

export default router;
