import express from 'express';
import { getProjects, createProject } from '../controllers/projectController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', getProjects);
router.post('/', protect, createProject);

export default router;
