import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getUsersDB } from '../db/db';
import { IUser } from '../db/schema';

// Helper for ID generation
const generateId = () => crypto.randomUUID();

export const getUsers = async (req: Request, res: Response) => {
    try {
        const db = await getUsersDB();
        // Return all users, maybe exclude sensitive info like passwordHash for general list?
        // Admin needs to see full list.
        const users = db.data.users.map(({ passwordHash, ...user }) => user);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const db = await getUsersDB();
        const user = db.data.users.find(u => u.id === req.params.id);

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

export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, rollNo, semester } = req.body;
        const db = await getUsersDB();

        if (db.data.users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser: IUser = {
            id: generateId(),
            name,
            email,
            passwordHash,
            role: role || 'guest',
            rollNo,
            semester,
            isVerified: true, // Admin created users are verified
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.data.users.push(newUser);
        await db.write();

        const { passwordHash: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);

    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const db = await getUsersDB();
        const index = db.data.users.findIndex(u => u.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, role, rollNo, semester, password } = req.body;
        const user = db.data.users[index];

        // If updating password
        let passwordHash = user.passwordHash;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            passwordHash = await bcrypt.hash(password, salt);
        }

        db.data.users[index] = {
            ...user,
            name: name || user.name,
            email: email || user.email,
            role: role || user.role,
            rollNo: rollNo || user.rollNo,
            semester: semester || user.semester,
            passwordHash,
            updatedAt: new Date().toISOString()
        };

        await db.write();

        const { passwordHash: _, ...updatedUser } = db.data.users[index];
        res.json(updatedUser);

    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const db = await getUsersDB();
        const initialLength = db.data.users.length;
        db.data.users = db.data.users.filter(u => u.id !== req.params.id);

        if (db.data.users.length < initialLength) {
            await db.write();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
