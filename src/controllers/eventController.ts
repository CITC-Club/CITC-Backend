import { Request, Response } from 'express';
import { getEventsDB } from '../db/db'; // removed getAllEvents as getEventsDB covers it now
import { IEvent } from '../db/schema';
import crypto from 'crypto';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

const generateId = () => crypto.randomUUID();

export const getEvents = async (req: Request, res: Response) => {
    try {
        const db = await getEventsDB();
        let events = db.data.events;

        // 1. Filter by published status (always enforce for public API, unless admin - but spec says "Show only events where published === true")
        // Assuming this is public-facing.
        events = events.filter(e => e.published === true);

        // 2. Query Filters
        const { year, type, status } = req.query;

        if (year) {
            events = events.filter(e => e.year === parseInt(year as string));
        }

        if (type) {
            // Case-insensitive comparison? Spec doesn't say, but safe practice.
            events = events.filter(e => e.type.toLowerCase() === (type as string).toLowerCase());
        }

        if (status) {
            events = events.filter(e => e.status === (status as string));
        }

        // 3. Sorting
        // "Sort by date (upcoming first)"
        // Strategy:
        // - Split into Upcoming vs Completed/Cancelled
        // - Upcoming: Sort ASC (nearest first)
        // - Completed: Sort DESC (most recent first)
        // - Concatenate: Upcoming + Completed
        // OR simpler: Just sort by status priority (upcoming > others) then date?
        // Let's stick to the split strategy as it's most user-friendly.

        const upcoming = events.filter(e => e.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const past = events.filter(e => e.status !== 'upcoming').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const sortedEvents = [...upcoming, ...past];

        res.json(sortedEvents);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getEvent = async (req: Request, res: Response) => {
    try {
        const db = await getEventsDB();
        const event = db.data.events.find(e => e.slug === req.params.slug);

        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        const db = await getEventsDB();
        const newEvent: IEvent = {
            id: generateId(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.data.events.push(newEvent);
        await db.write();

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

// Simplified RSVP? Or remove if not needed. Keeping simplified version just in case.
export const rsvpEvent = async (req: Request, res: Response) => {
    // Current schema doesn't have attendees list in the simplified IEvent I defined?
    // Let's check schema.
    // IEvent in my schema update DOES NOT have attendees.
    // So I will remove RSVP for now to avoid errors.
    res.status(501).json({ message: 'RSVP not implemented in new schema' });
};

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const db = await getEventsDB();
        const index = db.data.events.findIndex(e => e.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ message: 'Event not found' });
        }

        db.data.events[index] = {
            ...db.data.events[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        await db.write();
        res.json(db.data.events[index]);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const db = await getEventsDB();
        const initialLength = db.data.events.length;
        db.data.events = db.data.events.filter(e => e.id !== req.params.id);

        if (db.data.events.length < initialLength) {
            await db.write();
            res.json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
