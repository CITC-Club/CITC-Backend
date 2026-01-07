import { Request, Response } from 'express';
import { getEventsDB, getAllEvents, getUsersDB } from '../db/db';
import { IEvent } from '../db/schema';
import crypto from 'crypto';

const generateId = () => crypto.randomUUID();

export const getEvents = async (req: Request, res: Response) => {
    try {
        const events = await getAllEvents();
        // Sort by startAt
        events.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getEvent = async (req: Request, res: Response) => {
    try {
        const events = await getAllEvents();
        const event = events.find(e => e.slug === req.params.slug);

        if (event) {
            // Manual populate createdBy
            const usersDb = await getUsersDB();
            const creator = usersDb.data.users.find(u => u.id === event.createdBy);
            const populatedEvent = {
                ...event,
                createdBy: creator ? { _id: creator.id, name: creator.name } : null
            };
            res.json(populatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    try {
        const { startAt } = req.body;
        const year = new Date(startAt).getFullYear().toString();
        const db = await getEventsDB(year);

        // @ts-ignore
        const userId = req.user.id;

        const newEvent: IEvent = {
            id: generateId(),
            ...req.body,
            createdBy: userId,
            attendees: [],
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

export const rsvpEvent = async (req: Request, res: Response) => {
    try {
        // We need to find the event location to update it
        // This is inefficient but necessary without an index mapping ID -> Year
        const events = await getAllEvents();
        const event = events.find(e => e.id === req.params.id);

        if (event) {
            const year = new Date(event.startAt).getFullYear().toString();
            const db = await getEventsDB(year);
            const eventIndex = db.data.events.findIndex(e => e.id === req.params.id);

            if (eventIndex === -1) {
                return res.status(404).json({ message: 'Event not found in year partition' });
            }

            // @ts-ignore
            const userId = req.user.id;

            if (db.data.events[eventIndex].attendees.includes(userId)) {
                return res.status(400).json({ message: 'Already RSVPed' });
            }

            db.data.events[eventIndex].attendees.push(userId);
            await db.write();

            res.json({ message: 'RSVP successful' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    try {
        // Find existing event to get year
        const allEvents = await getAllEvents();
        const existingEvent = allEvents.find(e => e.id === req.params.id);

        if (!existingEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const oldYear = new Date(existingEvent.startAt).getFullYear().toString();

        // Check if startAt is changing and if it changes the year
        const newStartAt = req.body.startAt;
        let newYear = oldYear;
        if (newStartAt) {
            newYear = new Date(newStartAt).getFullYear().toString();
        }

        if (oldYear !== newYear) {
            // Move event: Delete from old db, add to new db
            const oldDb = await getEventsDB(oldYear);
            const newDb = await getEventsDB(newYear);

            const eventIndex = oldDb.data.events.findIndex(e => e.id === req.params.id);
            if (eventIndex > -1) {
                const [movedEvent] = oldDb.data.events.splice(eventIndex, 1);
                const updatedEvent = { ...movedEvent, ...req.body, updatedAt: new Date().toISOString() };
                newDb.data.events.push(updatedEvent);

                await oldDb.write();
                await newDb.write();
                return res.json(updatedEvent);
            }
        } else {
            // Update in place
            const db = await getEventsDB(oldYear);
            const eventIndex = db.data.events.findIndex(e => e.id === req.params.id);

            if (eventIndex > -1) {
                const updatedEvent = { ...db.data.events[eventIndex], ...req.body, updatedAt: new Date().toISOString() };
                db.data.events[eventIndex] = updatedEvent;
                await db.write();
                return res.json(updatedEvent);
            }
        }

        res.status(404).json({ message: 'Event not found during update' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const allEvents = await getAllEvents();
        const existingEvent = allEvents.find(e => e.id === req.params.id);

        if (!existingEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const year = new Date(existingEvent.startAt).getFullYear().toString();
        const db = await getEventsDB(year);

        const initialLength = db.data.events.length;
        db.data.events = db.data.events.filter(e => e.id !== req.params.id);

        if (db.data.events.length < initialLength) {
            await db.write();
            res.json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found in partition' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};


