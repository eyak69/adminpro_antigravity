import { Router } from 'express';
import { getParametro, updateParametro, getAllParametros, createParametro, deleteParametro } from '../controllers/parametro.controller';

const router = Router();

router.get('/', getAllParametros);
router.post('/', createParametro);
router.get('/:clave', getParametro);
router.put('/:clave', updateParametro);
router.delete('/:clave', deleteParametro);

export default router;
