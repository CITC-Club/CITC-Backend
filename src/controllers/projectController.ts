import { Request, Response } from 'express';
import Project from '../models/Project';

export const getProjects = async (req: Request, res: Response) => {
    try {
        const projects = await Project.find().populate('contributors', 'name');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};
