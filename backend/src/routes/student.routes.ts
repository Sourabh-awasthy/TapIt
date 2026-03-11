import { Router } from 'express';
import { listStudents, getStudent, getStudentMetrics, createStudent, updateStudent } from '../controllers/student.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();

router.get('/',         authenticate, authorize('admin', 'teacher'), listStudents);
router.post('/',        authenticate, authorize('admin'), createStudent);
router.get('/:id',      authenticate, getStudent);
router.patch('/:id',    authenticate, authorize('admin'), updateStudent);
router.get('/:id/metrics', authenticate, getStudentMetrics);

export default router;
