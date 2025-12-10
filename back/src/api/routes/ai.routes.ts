import { Router } from "express";
import { AiController } from "../controllers/ai.controller";

const router = Router();
const aiController = new AiController();

router.post("/parse", aiController.parse);
router.post("/analyze", aiController.analyze);
router.post("/classify", aiController.classify);

export default router;
