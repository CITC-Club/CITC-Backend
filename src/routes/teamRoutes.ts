import express from 'express';
import {
    getAllTeamMembers,
    getTeamMemberById,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember
} from '../controllers/teamController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllTeamMembers);
router.get('/:id', getTeamMemberById);

// Admin-only routes
router.post('/', protect, authorize('admin'), createTeamMember);
router.put('/:id', protect, authorize('admin'), updateTeamMember);
router.delete('/:id', protect, authorize('admin'), deleteTeamMember);

export default router;
