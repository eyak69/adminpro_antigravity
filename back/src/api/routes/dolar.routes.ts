import { Router } from "express";
import { DolarController } from "../controllers/dolar.controller";

const router = Router();
const dolarController = new DolarController();

router.get("/scrape", dolarController.scrape);

export default router;
