import { Router } from "express";
import { TipoMovimientoController } from "../controllers/tipoMovimiento.controller";

const router = Router();
const tipoMovimientoController = new TipoMovimientoController();

router.get("/", tipoMovimientoController.getAll);
router.get("/:id", tipoMovimientoController.getById);
router.post("/", tipoMovimientoController.create);
router.put("/:id", tipoMovimientoController.update);
router.delete("/:id", tipoMovimientoController.delete);

export default router;
