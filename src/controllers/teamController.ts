import { Request, Response } from 'express';
import { getTeamsDB } from '../db/db';
import { ITeamMember } from '../db/schema';
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
        const teamMember = db.data.teams.find(t => t.id === req.params.id);

        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        res.json(teamMember);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Create new team member
// @route   POST /api/team
// @access  Private/Admin
export const createTeamMember = async (req: AuthRequest, res: Response) => {
    try {
        const { name, role, category, image, bio, social, order } = req.body;

        if (!name || !role || !category) {
            return res.status(400).json({ message: 'Name, role, and category are required' });
        }

        const db = await getTeamsDB();

        const newMember: ITeamMember = {
            id: generateId(),
            name,
            role,
            category,
            image,
            bio,
            social,
            order: order || 0,
            isActive: true,
            createdBy: req.user!.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.data.teams.push(newMember);
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
        const { name, role, category, image, bio, social, order, isActive } = req.body;

        const db = await getTeamsDB();
        const memberIndex = db.data.teams.findIndex(t => t.id === req.params.id);

        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        const member = db.data.teams[memberIndex];

        // Update fields
        if (name !== undefined) member.name = name;
        if (role !== undefined) member.role = role;
        if (category !== undefined) member.category = category;
        if (image !== undefined) member.image = image;
        if (bio !== undefined) member.bio = bio;
        if (social !== undefined) member.social = social;
        if (order !== undefined) member.order = order;
        if (isActive !== undefined) member.isActive = isActive;

        member.updatedAt = new Date().toISOString();

        db.data.teams[memberIndex] = member;
        await db.write();

        res.json(member);
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
        const initialLength = db.data.teams.length;
        db.data.teams = db.data.teams.filter(t => t.id !== req.params.id);

        if (db.data.teams.length < initialLength) {
            await db.write();
            res.json({ message: 'Team member removed' });
        } else {
            res.status(404).json({ message: 'Team member not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

