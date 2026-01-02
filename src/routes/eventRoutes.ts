import express from 'express';
import { getEvents, getEvent, createEvent, rsvpEvent } from '../controllers/eventController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getEvents);
router.get('/:slug', getEvent);
router.post('/', protect, authorize('admin', 'mentor'), createEvent);
router.post('/:id/rsvp', protect, rsvpEvent);

export default router;
