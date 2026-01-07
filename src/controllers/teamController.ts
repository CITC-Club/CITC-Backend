import { Request, Response } from 'express';
import { getTeamsDB } from '../db/db';
import { IMember, ITeam } from '../db/schema'; // ITeamMember might be gone, need to check if I left it
import crypto from 'crypto';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

const generateId = () => crypto.randomUUID();

// @desc    Get all active team members
// @route   GET /api/team
// @access  Public
export const getAllTeamMembers = async (req: Request, res: Response) => {
    try {
        const db = await getTeamsDB();
        // Return both teams and members
        res.json({
            teams: db.data.teams,
            members: db.data.members
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Get single team member
// @route   GET /api/team/:id
// @access  Public
export const getTeamMemberById = async (req: Request, res: Response) => {
    try {
        const db = await getTeamsDB();
        const member = db.data.members.find(m => m.id === req.params.id);

        if (!member) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        res.json(member);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Create new team member
// @route   POST /api/team
// @access  Private/Admin
export const createTeamMember = async (req: AuthRequest, res: Response) => {
    // Simplified for now until full CRUD is needed
    try {
        const db = await getTeamsDB();
        const newMember: IMember = {
            id: generateId(),
            ...req.body
        };
        db.data.members.push(newMember);
        await db.write();
        res.status(201).json(newMember);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private/Admin
export const updateTeamMember = async (req: AuthRequest, res: Response) => {
    try {
        const db = await getTeamsDB();
        const index = db.data.members.findIndex(m => m.id === req.params.id);

        if (index === -1) return res.status(404).json({ message: 'Member not found' });

        db.data.members[index] = { ...db.data.members[index], ...req.body };
        await db.write();
        res.json(db.data.members[index]);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private/Admin
export const deleteTeamMember = async (req: Request, res: Response) => {
    try {
        const db = await getTeamsDB();
        const initialLength = db.data.members.length;
        db.data.members = db.data.members.filter(m => m.id !== req.params.id);

        if (db.data.members.length < initialLength) {
            await db.write();
            res.json({ message: 'Team member removed' });
        } else {
            res.status(404).json({ message: 'Team member not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
