import express from 'express';
import { getUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes are protected and restricted to admin
router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
