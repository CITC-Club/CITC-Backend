import { Request, Response } from 'express';
import { getProjectsDB, getUsersDB } from '../db/db';
import { IProject } from '../db/schema';
import crypto from 'crypto';

const generateId = () => crypto.randomUUID();

export const getProjects = async (req: Request, res: Response) => {
    try {
        const db = await getProjectsDB();
        const usersDb = await getUsersDB();

        // Populate contributors
        const projects = db.data.projects.map(p => ({
            ...p,
            contributors: p.contributors.map(cId => {
                const user = usersDb.data.users.find(u => u.id === cId);
                return user ? { _id: user.id, name: user.name } : cId;
            })
        }));

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const db = await getProjectsDB();

        const newProject: IProject = {
            id: generateId(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.data.projects.push(newProject);
        await db.write();

        res.status(201).json(newProject);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

