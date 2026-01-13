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
exports.getEventsDB = exports.getTeamsDB = exports.getProjectsDB = exports.getUsersDB = void 0;
exports.initDB = initDB;
const node_1 = require("lowdb/node");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/* -------------------------------------------------------------------------- */
/*                                   Paths                                    */
/* -------------------------------------------------------------------------- */
const ROOT = process.cwd();
const DATA_DIR = path_1.default.join(ROOT, 'db');
const DB_PATHS = {
    users: path_1.default.join(DATA_DIR, 'users.json'),
    projects: path_1.default.join(DATA_DIR, 'projects.json'),
    teams: path_1.default.join(DATA_DIR, 'teams.json'),
    events: path_1.default.join(DATA_DIR, 'events.json'),
};
/* -------------------------------------------------------------------------- */
/*                             Ensure DB Directory                             */
/* -------------------------------------------------------------------------- */
function ensureDir(dir) {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
}
ensureDir(DATA_DIR);
/* -------------------------------------------------------------------------- */
/*                               DB Singletons                                 */
/* -------------------------------------------------------------------------- */
let usersDB;
let projectsDB;
let teamsDB;
let eventsDB;
/* -------------------------------------------------------------------------- */
/*                             Initialization API                              */
/* -------------------------------------------------------------------------- */
function initDB() {
    return __awaiter(this, void 0, void 0, function* () {
        usersDB = yield (0, node_1.JSONFilePreset)(DB_PATHS.users, { users: [] });
        projectsDB = yield (0, node_1.JSONFilePreset)(DB_PATHS.projects, { projects: [] });
        teamsDB = yield (0, node_1.JSONFilePreset)(DB_PATHS.teams, { members: [] });
        eventsDB = yield (0, node_1.JSONFilePreset)(DB_PATHS.events, { events: [] });
        console.log('LowDB initialized (no seeding)');
    });
}
/* -------------------------------------------------------------------------- */
/*                               DB Accessors                                  */
/* -------------------------------------------------------------------------- */
const getUsersDB = () => usersDB;
exports.getUsersDB = getUsersDB;
const getProjectsDB = () => projectsDB;
exports.getProjectsDB = getProjectsDB;
const getTeamsDB = () => teamsDB;
exports.getTeamsDB = getTeamsDB;
const getEventsDB = () => eventsDB;
exports.getEventsDB = getEventsDB;
