import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { getUsersDB } from '../db/db';
import { IUser } from '../db/schema';

/* =========================
   SETUP GOOGLE CLIENT
========================= */

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

/* =========================
   HELPERS
========================= */

const generateId = () => crypto.randomUUID();

const generateToken = (id: string, role: string) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '30d' }
  );
};

/* =========================
   GOOGLE LOGIN (ID TOKEN)
========================= */

export const googleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: 'ID token required' });
  }

  try {
    /* =========================
       1️⃣ VERIFY ID TOKEN
    ========================= */

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified,
      hd,
    } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({ message: 'Email not verified' });
    }

    /* =========================
       OPTIONAL: DOMAIN RESTRICT
    ========================= */

    /* =========================
       OPTIONAL: DOMAIN RESTRICT
    ========================= */

    // if (hd !== 'ncit.edu.np') {
    //   return res.status(403).json({
    //     message: 'Only @ncit.edu.np accounts are allowed',
    //   });
    // }

    /* =========================
       2️⃣ FIND OR CREATE USER
    ========================= */

    const db = await getUsersDB();
    let user = db.data.users.find(u => u.email === email);
    const now = new Date().toISOString();

    if (!user) {
      // If this is the FIRST user in the system, make them admin.
      // Otherwise, default to 'guest' (or 'member' if you prefer, but 'guest' is safer).
      const isFirstUser = db.data.users.length === 0;

      const newUser: IUser = {
        id: generateId(),
        name: name || 'Google User',
        email,
        passwordHash: '',
        role: isFirstUser ? 'admin' : 'guest',
        isVerified: true,
        avatarUrl: picture,
        googleId,
        createdAt: now,
        updatedAt: now,
      };

      db.data.users.push(newUser);
      user = newUser;
    } else {
      user.name = name || user.name;
      user.avatarUrl = picture;
      user.googleId = googleId;
      user.updatedAt = now;
    }

    await db.write();

    /* =========================
       3️⃣ ISSUE YOUR JWT
    ========================= */

    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      token, // ✅ YOUR BEARER TOKEN
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(401).json({
      message: 'Google authentication failed',
    });
  }
};


export const getMe = async (req: Request, res: Response) => {
  const authReq = req as any;
  const userId = authReq.user?.id;

  try {
    const db = await getUsersDB();
    const user = db.data.users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};