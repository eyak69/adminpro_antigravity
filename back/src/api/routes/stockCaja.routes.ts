import { Router } from "express";
import { StockCajaController } from "../controllers/stockCaja.controller";

const router = Router();
const stockCajaController = new StockCajaController();

router.get("/", stockCajaController.getAll);
router.get("/:id", stockCajaController.getById);
router.post("/", stockCajaController.create);
router.put("/:id", stockCajaController.update);
router.delete("/:id", stockCajaController.delete);

export default router;
