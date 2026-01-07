"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const eventController_1 = require("../controllers/eventController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', eventController_1.getEvents);
router.get('/:slug', eventController_1.getEvent);
router.post('/', auth_1.protect, (0, auth_1.authorize)('admin'), eventController_1.createEvent);
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), eventController_1.updateEvent);
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), eventController_1.deleteEvent);
router.post('/:id/rsvp', auth_1.protect, eventController_1.rsvpEvent);
exports.default = router;
