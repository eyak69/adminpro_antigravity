import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/google", authController.googleLogin);
router.get("/status", authController.getStatus);

export default router;
