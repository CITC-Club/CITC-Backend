import { Request, Response } from 'express';
import { getTeamsDB } from '../db/db';
import { IMember } from '../db/schema';
import crypto from 'crypto';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const generateId = () => crypto.randomUUID();

// Helper to sanitize type input
const sanitizeMemberType = (type: any): IMember['type'] => {
  const t = String(type).trim();
  const validTypes: IMember['type'][] = ['Executive', 'Faculty Advisor', 'Mentor', 'Alumni'];
  return validTypes.includes(t as IMember['type']) ? (t as IMember['type']) : 'Executive';
};

// -------------------------------------------------------------------------- //
// GET ALL MEMBERS
// -------------------------------------------------------------------------- //
export const getAllTeamMembers = async (req: Request, res: Response) => {
  try {
    const db = getTeamsDB();
    res.json({ members: db.data.members });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// -------------------------------------------------------------------------- //
// GET MEMBER BY ID
// -------------------------------------------------------------------------- //
export const getTeamMemberById = async (req: Request, res: Response) => {
  try {
    const db = getTeamsDB();
    const member = db.data.members.find(m => m.id === req.params.id);

    if (!member) return res.status(404).json({ message: 'Team member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// -------------------------------------------------------------------------- //
// CREATE MEMBER
// -------------------------------------------------------------------------- //
export const createTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const db = getTeamsDB();

    const {
      name,
      college_year,
      member_year,
      email,
      photo,
      type,
      title,
      socials,
    } = req.body;

    if (!name || !member_year) {
      return res.status(400).json({ message: 'Missing required fields: name or member_year' });
    }

    // Parse socials if it's a string (e.g. from FormData)
    let parsedSocials = socials;
    if (typeof socials === 'string') {
      try {
        parsedSocials = JSON.parse(socials);
      } catch (e) {
        parsedSocials = {};
      }
    }

    const newMember: IMember = {
      id: generateId(),
      name: String(name).trim(),
      college_year: college_year ? Number(college_year) : undefined,
      member_year: Number(member_year),
      email: email?.trim() || undefined,
      photo: photo?.trim() || undefined,
      type: sanitizeMemberType(type),
      title: title?.trim() || undefined,
      socials: parsedSocials || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.data.members.push(newMember);
    await db.write();

    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// -------------------------------------------------------------------------- //
// UPDATE MEMBER
// -------------------------------------------------------------------------- //
export const updateTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const db = getTeamsDB();
    const index = db.data.members.findIndex(m => m.id === req.params.id);

    if (index === -1) return res.status(404).json({ message: 'Team member not found' });

    const existing = db.data.members[index];
    const {
      name,
      college_year,
      member_year,
      email,
      photo,
      type,
      title,
      socials,
    } = req.body;

    const updated: IMember = {
      ...existing,
      name: name ? String(name).trim() : existing.name,
      college_year: college_year !== undefined ? Number(college_year) : existing.college_year,
      member_year: member_year !== undefined ? Number(member_year) : existing.member_year,
      email: email?.trim() || existing.email,
      photo: photo?.trim() || existing.photo,
      type: type ? sanitizeMemberType(type) : existing.type,
      title: title?.trim() || existing.title,
      socials: socials || existing.socials,
      updatedAt: new Date().toISOString(),
    };

    db.data.members[index] = updated;
    await db.write();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// -------------------------------------------------------------------------- //
// DELETE MEMBER
// -------------------------------------------------------------------------- //
export const deleteTeamMember = async (req: Request, res: Response) => {
  try {
    const db = getTeamsDB();
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
