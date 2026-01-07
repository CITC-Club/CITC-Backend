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
exports.getAllEvents = exports.getEventsDB = exports.getTeamsDB = exports.getProjectsDB = exports.getUsersDB = void 0;
const node_1 = require("lowdb/node");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DATA_DIR = path_1.default.resolve(process.cwd(), 'data');
const EVENTS_DIR = path_1.default.join(DATA_DIR, 'events');
const TEAMS_DIR = path_1.default.join(DATA_DIR, 'teams'); // Although teams is one file, keeping consistent path logic
// Ensure directories exist
if (!fs_1.default.existsSync(DATA_DIR))
    fs_1.default.mkdirSync(DATA_DIR);
if (!fs_1.default.existsSync(EVENTS_DIR))
    fs_1.default.mkdirSync(EVENTS_DIR);
if (!fs_1.default.existsSync(TEAMS_DIR))
    fs_1.default.mkdirSync(TEAMS_DIR);
// Initialize DBs with default data
const defaultUsers = { users: [] };
const defaultProjects = { projects: [] };
const defaultTeams = { teams: [] };
// Singleton instances for static files
const getUsersDB = () => __awaiter(void 0, void 0, void 0, function* () { return yield (0, node_1.JSONFilePreset)(path_1.default.join(DATA_DIR, 'users.json'), defaultUsers); });
exports.getUsersDB = getUsersDB;
const getProjectsDB = () => __awaiter(void 0, void 0, void 0, function* () { return yield (0, node_1.JSONFilePreset)(path_1.default.join(DATA_DIR, 'projects.json'), defaultProjects); });
exports.getProjectsDB = getProjectsDB;
const getTeamsDB = () => __awaiter(void 0, void 0, void 0, function* () { return yield (0, node_1.JSONFilePreset)(path_1.default.join(TEAMS_DIR, 'teams.json'), defaultTeams); });
exports.getTeamsDB = getTeamsDB;
// Dynamic loader for events (partitioned by year)
const getEventsDB = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = path_1.default.join(EVENTS_DIR, `${year}.json`);
    const defaultEvents = { events: [] };
    return yield (0, node_1.JSONFilePreset)(filePath, defaultEvents);
});
exports.getEventsDB = getEventsDB;
// Helper to get all events (aggregating years) - optional, for 'getAll' logic
const getAllEvents = () => __awaiter(void 0, void 0, void 0, function* () {
    const files = fs_1.default.readdirSync(EVENTS_DIR).filter(f => f.endsWith('.json'));
    let allEvents = [];
    for (const file of files) {
        const db = yield (0, node_1.JSONFilePreset)(path_1.default.join(EVENTS_DIR, file), { events: [] });
        allEvents = [...allEvents, ...db.data.events];
    }
    return allEvents;
});
exports.getAllEvents = getAllEvents;
