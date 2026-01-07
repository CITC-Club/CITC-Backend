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
exports.createProject = exports.getProjects = void 0;
const db_1 = require("../db/db");
const crypto_1 = __importDefault(require("crypto"));
const generateId = () => crypto_1.default.randomUUID();
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getProjectsDB)();
        const usersDb = yield (0, db_1.getUsersDB)();
        // Populate contributors
        const projects = db.data.projects.map(p => (Object.assign(Object.assign({}, p), { contributors: p.contributors.map(cId => {
                const user = usersDb.data.users.find(u => u.id === cId);
                return user ? { _id: user.id, name: user.name } : cId;
            }) })));
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getProjects = getProjects;
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield (0, db_1.getProjectsDB)();
        const newProject = Object.assign(Object.assign({ id: generateId() }, req.body), { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        db.data.projects.push(newProject);
        yield db.write();
        res.status(201).json(newProject);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createProject = createProject;
