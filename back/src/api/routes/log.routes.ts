import { Router } from 'express';
import { createLog, getLogs } from '../controllers/log.controller';

const router = Router();

router.post('/', createLog);
router.get('/', getLogs);

export default router;
