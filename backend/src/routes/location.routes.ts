import { Router } from 'express';
import { listLocations, updateLocation } from '../controllers/location.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/', authenticate, listLocations);
router.patch('/:code', authenticate, authorize('admin'), updateLocation);

export default router;
