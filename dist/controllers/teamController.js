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
// Helper to sanitize type input
const sanitizeMemberType = (type) => {
    const t = String(type).trim();
    const validTypes = ['Executive', 'Faculty Advisor', 'Mentor', 'Alumni'];
    return validTypes.includes(t) ? t : 'Executive';
};
// -------------------------------------------------------------------------- //
// GET ALL MEMBERS
// -------------------------------------------------------------------------- //
const getAllTeamMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = (0, db_1.getTeamsDB)();
        res.json({ members: db.data.members });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllTeamMembers = getAllTeamMembers;
// -------------------------------------------------------------------------- //
// GET MEMBER BY ID
// -------------------------------------------------------------------------- //
const getTeamMemberById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = (0, db_1.getTeamsDB)();
        const member = db.data.members.find(m => m.id === req.params.id);
        if (!member)
            return res.status(404).json({ message: 'Team member not found' });
        res.json(member);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getTeamMemberById = getTeamMemberById;
// -------------------------------------------------------------------------- //
// CREATE MEMBER
// -------------------------------------------------------------------------- //
const createTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = (0, db_1.getTeamsDB)();
        const { name, college_year, member_year, email, photo, type, title, socials, } = req.body;
        if (!name || !member_year) {
            return res.status(400).json({ message: 'Missing required fields: name or member_year' });
        }
        // Parse socials if it's a string (e.g. from FormData)
        let parsedSocials = socials;
        if (typeof socials === 'string') {
            try {
                parsedSocials = JSON.parse(socials);
            }
            catch (e) {
                parsedSocials = {};
            }
        }
        const newMember = {
            id: generateId(),
            name: String(name).trim(),
            college_year: college_year ? Number(college_year) : undefined,
            member_year: Number(member_year),
            email: (email === null || email === void 0 ? void 0 : email.trim()) || undefined,
            photo: (photo === null || photo === void 0 ? void 0 : photo.trim()) || undefined,
            type: sanitizeMemberType(type),
            title: (title === null || title === void 0 ? void 0 : title.trim()) || undefined,
            socials: parsedSocials || undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        db.data.members.push(newMember);
        yield db.write();
        res.status(201).json(newMember);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createTeamMember = createTeamMember;
// -------------------------------------------------------------------------- //
// UPDATE MEMBER
// -------------------------------------------------------------------------- //
const updateTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = (0, db_1.getTeamsDB)();
        const index = db.data.members.findIndex(m => m.id === req.params.id);
        if (index === -1)
            return res.status(404).json({ message: 'Team member not found' });
        const existing = db.data.members[index];
        const { name, college_year, member_year, email, photo, type, title, socials, } = req.body;
        const updated = Object.assign(Object.assign({}, existing), { name: name ? String(name).trim() : existing.name, college_year: college_year !== undefined ? Number(college_year) : existing.college_year, member_year: member_year !== undefined ? Number(member_year) : existing.member_year, email: (email === null || email === void 0 ? void 0 : email.trim()) || existing.email, photo: (photo === null || photo === void 0 ? void 0 : photo.trim()) || existing.photo, type: type ? sanitizeMemberType(type) : existing.type, title: (title === null || title === void 0 ? void 0 : title.trim()) || existing.title, socials: socials || existing.socials, updatedAt: new Date().toISOString() });
        db.data.members[index] = updated;
        yield db.write();
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateTeamMember = updateTeamMember;
// -------------------------------------------------------------------------- //
// DELETE MEMBER
// -------------------------------------------------------------------------- //
const deleteTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = (0, db_1.getTeamsDB)();
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
