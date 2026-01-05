import { Request, Response } from 'express';
import Event from '../models/Event';

export const getEvents = async (req: Request, res: Response) => {
    try {
        const events = await Event.find().sort({ startAt: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getEvent = async (req: Request, res: Response) => {
    try {
        const event = await Event.findOne({ slug: req.params.slug }).populate('createdBy', 'name');
        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const event = await Event.create({ ...req.body, createdBy: req.user.id });
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const rsvpEvent = async (req: Request, res: Response) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            // @ts-ignore
            if (event.attendees.includes(req.user.id)) {
                return res.status(400).json({ message: 'Already RSVPed' });
            }
            // @ts-ignore
            event.attendees.push(req.user.id);
            await event.save();
            res.json({ message: 'RSVP successful' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = async (req: Request, res: Response) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const { title, slug, description, type, startAt, endAt, location, capacity, image, tags, organizer, attachments } = req.body;

        // Update fields
        if (title !== undefined) event.title = title;
        if (slug !== undefined) event.slug = slug;
        if (description !== undefined) event.description = description;
        if (type !== undefined) event.type = type;
        if (startAt !== undefined) event.startAt = startAt;
        if (endAt !== undefined) event.endAt = endAt;
        if (location !== undefined) event.location = location;
        if (capacity !== undefined) event.capacity = capacity;
        if (image !== undefined) event.image = image;
        if (tags !== undefined) event.tags = tags;
        if (organizer !== undefined) event.organizer = organizer;
        if (attachments !== undefined) event.attachments = attachments;

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

