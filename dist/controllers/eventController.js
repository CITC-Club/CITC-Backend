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
const db_1 = require("../db/db"); // removed getAllEvents as getEventsDB covers it now
const crypto_1 = __importDefault(require("crypto"));
const generateId = () => crypto_1.default.randomUUID();
const getEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getEventsDB)();
        let events = db.data.events;
        // 1. Filter by published status (always enforce for public API, unless admin - but spec says "Show only events where published === true")
        // Assuming this is public-facing.
        events = events.filter(e => e.published === true);
        // 2. Query Filters
        const { year, type, status } = req.query;
        if (year) {
            events = events.filter(e => e.year === parseInt(year));
        }
        if (type) {
            // Case-insensitive comparison? Spec doesn't say, but safe practice.
            events = events.filter(e => e.type.toLowerCase() === type.toLowerCase());
        }
        if (status) {
            events = events.filter(e => e.status === status);
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getEvents = getEvents;
const getEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getEventsDB)();
        const event = db.data.events.find(e => e.slug === req.params.slug);
        if (event) {
            res.json(event);
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
        const db = yield (0, db_1.getEventsDB)();
        const newEvent = Object.assign(Object.assign({ id: generateId() }, req.body), { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        db.data.events.push(newEvent);
        yield db.write();
        res.status(201).json(newEvent);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createEvent = createEvent;
// Simplified RSVP? Or remove if not needed. Keeping simplified version just in case.
const rsvpEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Current schema doesn't have attendees list in the simplified IEvent I defined?
    // Let's check schema.
    // IEvent in my schema update DOES NOT have attendees.
    // So I will remove RSVP for now to avoid errors.
    res.status(501).json({ message: 'RSVP not implemented in new schema' });
});
exports.rsvpEvent = rsvpEvent;
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getEventsDB)();
        const index = db.data.events.findIndex(e => e.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ message: 'Event not found' });
        }
        db.data.events[index] = Object.assign(Object.assign(Object.assign({}, db.data.events[index]), req.body), { updatedAt: new Date().toISOString() });
        yield db.write();
        res.json(db.data.events[index]);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateEvent = updateEvent;
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getEventsDB)();
        const initialLength = db.data.events.length;
        db.data.events = db.data.events.filter(e => e.id !== req.params.id);
        if (db.data.events.length < initialLength) {
            yield db.write();
            res.json({ message: 'Event removed' });
        }
        else {
            res.status(404).json({ message: 'Event not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteEvent = deleteEvent;
