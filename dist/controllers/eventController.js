"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.updateEvent = exports.rsvpEvent = exports.createEvent = exports.getEvent = exports.getEvents = void 0;
const db_1 = require("../db/db");
const crypto_1 = __importDefault(require("crypto"));
const generateId = () => crypto_1.default.randomUUID();
const getEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield (0, db_1.getAllEvents)();
        // Sort by startAt
        events.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getEvents = getEvents;
const getEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield (0, db_1.getAllEvents)();
        const event = events.find(e => e.slug === req.params.slug);
        if (event) {
            // Manual populate createdBy
            const usersDb = yield (0, db_1.getUsersDB)();
            const creator = usersDb.data.users.find(u => u.id === event.createdBy);
            const populatedEvent = Object.assign(Object.assign({}, event), { createdBy: creator ? { _id: creator.id, name: creator.name } : null });
            res.json(populatedEvent);
        }
        else {
            res.status(404).json({ message: 'Event not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getEvent = getEvent;
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startAt } = req.body;
        const year = new Date(startAt).getFullYear().toString();
        const db = yield (0, db_1.getEventsDB)(year);
        // @ts-ignore
        const userId = req.user.id;
        const newEvent = Object.assign(Object.assign({ id: generateId() }, req.body), { createdBy: userId, attendees: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        db.data.events.push(newEvent);
        yield db.write();
        res.status(201).json(newEvent);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createEvent = createEvent;
const rsvpEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // We need to find the event location to update it
        // This is inefficient but necessary without an index mapping ID -> Year
        const events = yield (0, db_1.getAllEvents)();
        const event = events.find(e => e.id === req.params.id);
        if (event) {
            const year = new Date(event.startAt).getFullYear().toString();
            const db = yield (0, db_1.getEventsDB)(year);
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
            yield db.write();
            res.json({ message: 'RSVP successful' });
        }
        else {
            res.status(404).json({ message: 'Event not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.rsvpEvent = rsvpEvent;
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find existing event to get year
        const allEvents = yield (0, db_1.getAllEvents)();
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
            const oldDb = yield (0, db_1.getEventsDB)(oldYear);
            const newDb = yield (0, db_1.getEventsDB)(newYear);
            const eventIndex = oldDb.data.events.findIndex(e => e.id === req.params.id);
            if (eventIndex > -1) {
                const [movedEvent] = oldDb.data.events.splice(eventIndex, 1);
                const updatedEvent = Object.assign(Object.assign(Object.assign({}, movedEvent), req.body), { updatedAt: new Date().toISOString() });
                newDb.data.events.push(updatedEvent);
                yield oldDb.write();
                yield newDb.write();
                return res.json(updatedEvent);
            }
        }
        else {
            // Update in place
            const db = yield (0, db_1.getEventsDB)(oldYear);
            const eventIndex = db.data.events.findIndex(e => e.id === req.params.id);
            if (eventIndex > -1) {
                const updatedEvent = Object.assign(Object.assign(Object.assign({}, db.data.events[eventIndex]), req.body), { updatedAt: new Date().toISOString() });
                db.data.events[eventIndex] = updatedEvent;
                yield db.write();
                return res.json(updatedEvent);
            }
        }
        res.status(404).json({ message: 'Event not found during update' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateEvent = updateEvent;
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allEvents = yield (0, db_1.getAllEvents)();
        const existingEvent = allEvents.find(e => e.id === req.params.id);
        if (!existingEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
        const year = new Date(existingEvent.startAt).getFullYear().toString();
        const db = yield (0, db_1.getEventsDB)(year);
        const initialLength = db.data.events.length;
        db.data.events = db.data.events.filter(e => e.id !== req.params.id);
        if (db.data.events.length < initialLength) {
            yield db.write();
            res.json({ message: 'Event removed' });
        }
        else {
            res.status(404).json({ message: 'Event not found in partition' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteEvent = deleteEvent;
