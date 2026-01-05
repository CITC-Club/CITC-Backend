import express from 'express';
import { getEvents, getEvent, createEvent, rsvpEvent, updateEvent, deleteEvent } from '../controllers/eventController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getEvents);
router.get('/:slug', getEvent);
router.post('/', protect, authorize('admin'), createEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);
router.post('/:id/rsvp', protect, rsvpEvent);

export default router;

