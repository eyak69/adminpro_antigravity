import { Router } from "express";
import { OperacionController } from "../controllers/operacion.controller";

const router = Router();
const operacionController = new OperacionController();

router.get("/", operacionController.getAll);
router.get("/:id", operacionController.getById);
router.post("/", operacionController.create);
router.put("/:id", operacionController.update);
router.delete("/:id", operacionController.delete);

export default router;
