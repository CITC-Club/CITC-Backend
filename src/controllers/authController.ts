import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getUsersDB } from '../db/db';
import { IUser } from '../db/schema';

// Helper for ID generation (using randomUUID if available or fallback)
const generateId = () => {
    return require('crypto').randomUUID();
};

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
    });
};

export const register = async (req: Request, res: Response) => {
    const { name, email, password, rollNo, semester, role } = req.body;

    try {
        const db = await getUsersDB();
        const userExists = db.data.users.find(u => u.email === email);

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser: IUser = {
            id: generateId(),
            name,
            email,
            passwordHash,
            rollNo,
            semester,
            role: role || 'guest',
            isVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.data.users.push(newUser);
        await db.write();

        res.status(201).json({
            _id: newUser.id, // Keeping _id for frontend compatibility if needed, or map to id
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            token: generateToken(newUser.id, newUser.role),
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const db = await getUsersDB();
        const user = db.data.users.find(u => u.email === email);

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            res.json({
                _id: user.id,
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const db = await getUsersDB();
        // @ts-ignore
        const user = db.data.users.find(u => u.id === req.user.id);

        if (user) {
            const { passwordHash, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
