import { Request, Response } from 'express';
import TeamMember, { ITeamMember } from '../models/TeamMember';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

// @desc    Get all active team members
// @route   GET /api/team
// @access  Public
export const getAllTeamMembers = async (req: Request, res: Response) => {
    try {
        const teamMembers = await TeamMember.find({ isActive: true })
            .sort({ category: 1, order: 1 })
            .select('-createdBy');

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
        const teamMember = await TeamMember.findById(req.params.id);

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

        const teamMember = await TeamMember.create({
            name,
            role,
            category,
            image,
            bio,
            social,
            order: order || 0,
            createdBy: req.user!.id
        });

        res.status(201).json(teamMember);
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

        const teamMember = await TeamMember.findById(req.params.id);

        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        // Update fields
        if (name !== undefined) teamMember.name = name;
        if (role !== undefined) teamMember.role = role;
        if (category !== undefined) teamMember.category = category;
        if (image !== undefined) teamMember.image = image;
        if (bio !== undefined) teamMember.bio = bio;
        if (social !== undefined) teamMember.social = social;
        if (order !== undefined) teamMember.order = order;
        if (isActive !== undefined) teamMember.isActive = isActive;

        const updatedTeamMember = await teamMember.save();
        res.json(updatedTeamMember);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private/Admin
export const deleteTeamMember = async (req: Request, res: Response) => {
    try {
        const teamMember = await TeamMember.findById(req.params.id);

        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        await teamMember.deleteOne();
        res.json({ message: 'Team member removed' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
