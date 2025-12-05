import { Router } from "express";
import { ClienteController } from "../controllers/cliente.controller";

const router = Router();
const clienteController = new ClienteController();

router.get("/", clienteController.getAll);
router.get("/:id", clienteController.getById);
router.get("/alias/:alias", clienteController.getByAlias);
router.post("/", clienteController.create);
router.put("/:id", clienteController.update);
router.delete("/:id", clienteController.delete);

export default router;
