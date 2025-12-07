import { Router } from 'express';
import {
    getParametro,
    updateParametro,
    getAllParametros,
    createParametro,
    deleteParametro,
    seedDefaults
} from '../controllers/parametro.controller';

const router = Router();

router.get('/', getAllParametros);
router.post('/', createParametro);
router.post('/defaults', seedDefaults); // New route for restoring defaults
router.get('/:clave', getParametro);
router.put('/:clave', updateParametro);
router.delete('/:clave', deleteParametro);

export const parametroRoutes = router; // Using named export to match index.ts likely structure
