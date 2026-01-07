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
        const teamMembers = db.data.teams.filter(t => t.isActive).sort((a, b) => {
            if (a.category === b.category) {
                return a.order - b.order;
            }
            return a.category.localeCompare(b.category);
        });
        // Group by category
        const grouped = {
            mentors: teamMembers.filter(m => m.category === 'mentor'),
            executiveCommittee: teamMembers.filter(m => m.category === 'executiveCommittee')
        };
        res.json(grouped);
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
        const teamMember = db.data.teams.find(t => t.id === req.params.id);
        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        res.json(teamMember);
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
    try {
        const { name, role, category, image, bio, social, order } = req.body;
        if (!name || !role || !category) {
            return res.status(400).json({ message: 'Name, role, and category are required' });
        }
        const db = yield (0, db_1.getTeamsDB)();
        const newMember = {
            id: generateId(),
            name,
            role,
            category,
            image,
            bio,
            social,
            order: order || 0,
            isActive: true,
            createdBy: req.user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        db.data.teams.push(newMember);
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
        const { name, role, category, image, bio, social, order, isActive } = req.body;
        const db = yield (0, db_1.getTeamsDB)();
        const memberIndex = db.data.teams.findIndex(t => t.id === req.params.id);
        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        const member = db.data.teams[memberIndex];
        // Update fields
        if (name !== undefined)
            member.name = name;
        if (role !== undefined)
            member.role = role;
        if (category !== undefined)
            member.category = category;
        if (image !== undefined)
            member.image = image;
        if (bio !== undefined)
            member.bio = bio;
        if (social !== undefined)
            member.social = social;
        if (order !== undefined)
            member.order = order;
        if (isActive !== undefined)
            member.isActive = isActive;
        member.updatedAt = new Date().toISOString();
        db.data.teams[memberIndex] = member;
        yield db.write();
        res.json(member);
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
        const initialLength = db.data.teams.length;
        db.data.teams = db.data.teams.filter(t => t.id !== req.params.id);
        if (db.data.teams.length < initialLength) {
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
