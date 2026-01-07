"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teamController_1 = require("../controllers/teamController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/', teamController_1.getAllTeamMembers);
router.get('/:id', teamController_1.getTeamMemberById);
// Admin-only routes
router.post('/', auth_1.protect, (0, auth_1.authorize)('admin'), teamController_1.createTeamMember);
router.put('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), teamController_1.updateTeamMember);
router.delete('/:id', auth_1.protect, (0, auth_1.authorize)('admin'), teamController_1.deleteTeamMember);
exports.default = router;
