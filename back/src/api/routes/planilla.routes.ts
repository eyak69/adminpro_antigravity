import { Router } from "express";
import { PlanillaController } from "../controllers/planilla.controller";

const router = Router();
const planillaController = new PlanillaController();

router.get("/balance", planillaController.getBalance); // Must be before /:id
router.get("/", planillaController.getAll);
router.get("/rates", planillaController.getRates);
router.get("/last-cotizacion/:monedaId", planillaController.getLastCotizacion);
router.get("/:id", planillaController.getById);
// router.post("/", (req, res) => controller.create(req, res)); // Disabled to enforce TransactionService
router.put("/:id", planillaController.update);
router.delete("/:id", planillaController.delete);
router.get("/rates", planillaController.getRates);
// router.post("/", (req, res) => controller.create(req, res)); // Disabled to enforce TransactionService
router.put("/:id", planillaController.update);
router.delete("/:id", planillaController.delete);

export default router;
