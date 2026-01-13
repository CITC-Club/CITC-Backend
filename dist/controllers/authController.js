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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.googleLogin = exports.login = exports.register = void 0;
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db/db");
// Helper for ID generation (using randomUUID if available or fallback)
const generateId = () => {
    return require('crypto').randomUUID();
};
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, rollNo, semester, role } = req.body;
    try {
        const db = yield (0, db_1.getUsersDB)();
        const userExists = db.data.users.find(u => u.email === email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const passwordHash = yield bcryptjs_1.default.hash(password, salt);
        const newUser = {
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
        yield db.write();
        res.status(201).json({
            _id: newUser.id, // Keeping _id for frontend compatibility if needed, or map to id
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            token: generateToken(newUser.id, newUser.role),
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const db = yield (0, db_1.getUsersDB)();
        const user = db.data.users.find(u => u.email === email);
        if (user && (yield bcryptjs_1.default.compare(password, user.passwordHash))) {
            res.json({
                _id: user.id,
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.login = login;
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }
    try {
        // Use axios to fetch user info from Google using the Access Token
        const response = yield axios_1.default.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const { email, name, picture } = response.data;
        if (!email) {
            return res.status(400).json({ message: 'Invalid Google Token Response' });
        }
        const db = yield (0, db_1.getUsersDB)();
        let user = db.data.users.find(u => u.email === email);
        let status = 200;
        if (!user) {
            // Register new google user
            user = {
                id: generateId(),
                name: name || 'Google User',
                email: email,
                passwordHash: '', // No password for google users
                role: 'guest', // Default role
                isVerified: true, // Google emails are verified
                avatarUrl: picture,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            db.data.users.push(user);
            yield db.write();
            status = 201;
        }
        res.status(status).json({
            _id: user.id,
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role),
        });
    }
    catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Google authentication failed' });
    }
});
exports.googleLogin = googleLogin;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getUsersDB)();
        // @ts-ignore
        const user = db.data.users.find(u => u.id === req.user.id);
        if (user) {
            const { passwordHash } = user, userWithoutPassword = __rest(user, ["passwordHash"]);
            res.json(userWithoutPassword);
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMe = getMe;
