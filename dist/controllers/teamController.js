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
exports.deleteTeamMember = exports.updateTeamMember = exports.createTeamMember = exports.getTeamMemberById = exports.getAllTeamMembers = void 0;
const db_1 = require("../db/db");
const crypto_1 = __importDefault(require("crypto"));
const generateId = () => crypto_1.default.randomUUID();
// @desc    Get all active team members
// @route   GET /api/team
// @access  Public
const getAllTeamMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getTeamsDB)();
        // Return both teams and members
        res.json({
            teams: db.data.teams,
            members: db.data.members
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllTeamMembers = getAllTeamMembers;
// @desc    Get single team member
// @route   GET /api/team/:id
// @access  Public
const getTeamMemberById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getTeamsDB)();
        const member = db.data.members.find(m => m.id === req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        res.json(member);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getTeamMemberById = getTeamMemberById;
// @desc    Create new team member
// @route   POST /api/team
// @access  Private/Admin
const createTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Simplified for now until full CRUD is needed
    try {
        const db = yield (0, db_1.getTeamsDB)();
        const newMember = Object.assign({ id: generateId() }, req.body);
        db.data.members.push(newMember);
        yield db.write();
        res.status(201).json(newMember);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createTeamMember = createTeamMember;
// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private/Admin
const updateTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getTeamsDB)();
        const index = db.data.members.findIndex(m => m.id === req.params.id);
        if (index === -1)
            return res.status(404).json({ message: 'Member not found' });
        db.data.members[index] = Object.assign(Object.assign({}, db.data.members[index]), req.body);
        yield db.write();
        res.json(db.data.members[index]);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateTeamMember = updateTeamMember;
// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private/Admin
const deleteTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getTeamsDB)();
        const initialLength = db.data.members.length;
        db.data.members = db.data.members.filter(m => m.id !== req.params.id);
        if (db.data.members.length < initialLength) {
            yield db.write();
            res.json({ message: 'Team member removed' });
        }
        else {
            res.status(404).json({ message: 'Team member not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteTeamMember = deleteTeamMember;
