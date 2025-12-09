import { Router } from "express";
import { AiController } from "../controllers/ai.controller";

const router = Router();
const aiController = new AiController();

router.post("/parse", aiController.parse);

export default router;
