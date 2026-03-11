import { Router } from 'express';
import { handleTap } from '../controllers/rfid.controller';
import { hardwareKey } from '../middleware/hardwareKey';

const router = Router();
router.post('/tap', hardwareKey, handleTap);

export default router;
