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
exports.getMe = exports.googleLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const google_auth_library_1 = require("google-auth-library");
const db_1 = require("../db/db");
/* =========================
   SETUP GOOGLE CLIENT
========================= */
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
/* =========================
   HELPERS
========================= */
const generateId = () => crypto_1.default.randomUUID();
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
/* =========================
   GOOGLE LOGIN (ID TOKEN)
========================= */
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ message: 'ID token required' });
    }
    try {
        /* =========================
           1️⃣ VERIFY ID TOKEN
        ========================= */
        const ticket = yield googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(401).json({ message: 'Invalid Google token' });
        }
        const { sub: googleId, email, name, picture, email_verified, hd, } = payload;
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
        const db = yield (0, db_1.getUsersDB)();
        let user = db.data.users.find(u => u.email === email);
        const now = new Date().toISOString();
        if (!user) {
            // If this is the FIRST user in the system, make them admin.
            // Otherwise, default to 'guest' (or 'member' if you prefer, but 'guest' is safer).
            const isFirstUser = db.data.users.length === 0;
            const newUser = {
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
        }
        else {
            user.name = name || user.name;
            user.avatarUrl = picture;
            user.googleId = googleId;
            user.updatedAt = now;
        }
        yield db.write();
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
    }
    catch (err) {
        console.error('Google auth error:', err);
        return res.status(401).json({
            message: 'Google authentication failed',
        });
    }
});
exports.googleLogin = googleLogin;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authReq = req;
    const userId = (_a = authReq.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const db = yield (0, db_1.getUsersDB)();
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
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getMe = getMe;
