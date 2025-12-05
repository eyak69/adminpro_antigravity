import { Router } from "express";
import { MonedaController } from "../controllers/moneda.controller";

const router = Router();
const monedaController = new MonedaController();

router.get("/", monedaController.getAll);
router.get("/:id", monedaController.getById);
router.post("/", monedaController.create);
router.put("/:id", monedaController.update);
router.delete("/:id", monedaController.delete);

export default router;
