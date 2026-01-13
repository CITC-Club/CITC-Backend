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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsDB = exports.getTeamsDB = exports.getProjectsDB = exports.getUsersDB = void 0;
const node_1 = require("lowdb/node");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DATA_DIR = path_1.default.resolve(process.cwd(), 'db');
const MEDIA_DIR = path_1.default.resolve(process.cwd(), 'media');
// Ensure directories exist
if (!fs_1.default.existsSync(DATA_DIR))
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
if (!fs_1.default.existsSync(MEDIA_DIR))
    fs_1.default.mkdirSync(MEDIA_DIR, { recursive: true });
// Initial Teams
const initialTeams = [
    { id: "t_mentors_2025", name: "Mentors", year: 2025 },
    { id: "t_exec_2025", name: "Executive Committee", year: 2025 },
    { id: "t_faculty", name: "Faculty Advisors", year: 2025 }
];
// Helpers
const getTeamImagePath = (filename, year) => {
    if (!filename)
        return "";
    return `/media/${year}/members/${filename}`;
};
const getMemberYearFromEmail = (email) => {
    // Extract the batch part from email (e.g., 22 from manash.221224)
    const match = email.match(/\.(\d{2})\d{4}@/);
    if (match && match[1]) {
        return 2000 + parseInt(match[1]);
    }
    return 2024;
};
// Read initial data from JSON file
const teamsDataPath = path_1.default.resolve(process.cwd(), 'src/data/teams.json');
let teamsData = { teamMembers: [], facultyAdvisor: {} };
try {
    if (fs_1.default.existsSync(teamsDataPath)) {
        const fileContent = fs_1.default.readFileSync(teamsDataPath, 'utf-8');
        teamsData = JSON.parse(fileContent);
    }
    else {
        console.warn(`Teams data file not found at ${teamsDataPath}`);
    }
}
catch (error) {
    console.error("Error reading teams.json:", error);
}
// Read events data from JSON file
const eventsDataPath = path_1.default.resolve(process.cwd(), 'src/data/events.json');
let eventsData = [];
try {
    if (fs_1.default.existsSync(eventsDataPath)) {
        const fileContent = fs_1.default.readFileSync(eventsDataPath, 'utf-8');
        eventsData = JSON.parse(fileContent);
    }
    else {
        console.warn(`Events data file not found at ${eventsDataPath}`);
    }
}
catch (error) {
    console.error("Error reading events.json:", error);
}
const initialFacultyAdvisor = {
    id: "fa1",
    name: ((_a = teamsData.facultyAdvisor) === null || _a === void 0 ? void 0 : _a.name) || "Er. Amit Shrivastava",
    type: "Faculty Advisor",
    title: ((_b = teamsData.facultyAdvisor) === null || _b === void 0 ? void 0 : _b.title) || "Faculty Advisor",
    department: ((_c = teamsData.facultyAdvisor) === null || _c === void 0 ? void 0 : _c.department) || "HOD, Department of Computer Engineering",
    email: ((_d = teamsData.facultyAdvisor) === null || _d === void 0 ? void 0 : _d.email) || "hod.computer@ncit.edu.np",
    photo: getTeamImagePath((_e = teamsData.facultyAdvisor) === null || _e === void 0 ? void 0 : _e.image, 2025), // Defaulting to 2025 as not in JSON
    year: 2025,
    member_year: 2025,
    teamId: "t_faculty"
};
const initialMembers = teamsData.teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    year: m.year,
    member_year: m.member_year,
    email: m.email,
    socials: {
        github: m.github !== "N/A" ? m.github : undefined,
        linkedin: m.linkedin !== "N/A" ? m.linkedin : undefined,
        instagram: m.instagram !== "N/A" && m.instagram !== "Iksha Gurung insta" ? m.instagram : undefined
    },
    photo: getTeamImagePath(m.image, m.member_year),
    type: "Regular",
    semester: m.year === 4 ? "VII/VIII" : (m.year === 3 ? "V/VI" : "III/IV"), // Approximate semester
    teamId: m.year === 4 ? "t_mentors_2025" : "t_exec_2025"
}));
// Process events to add image paths
const initialEvents = eventsData.map((e) => {
    var _a;
    return (Object.assign(Object.assign({}, e), { coverImage: `/media/${e.year}/events/${e.coverImage}`, gallery: (_a = e.gallery) === null || _a === void 0 ? void 0 : _a.map((img) => `/media/${e.year}/events/${img}`) }));
});
// Initialize DBs with default data
const defaultUsers = { users: [] };
const defaultProjects = { projects: [] };
const defaultTeams = { teams: [], members: [] };
const defaultEvents = { events: [] };
// Singleton instances
const getUsersDB = () => __awaiter(void 0, void 0, void 0, function* () { return yield (0, node_1.JSONFilePreset)(path_1.default.join(DATA_DIR, 'users.json'), defaultUsers); });
exports.getUsersDB = getUsersDB;
const getProjectsDB = () => __awaiter(void 0, void 0, void 0, function* () { return yield (0, node_1.JSONFilePreset)(path_1.default.join(DATA_DIR, 'projects.json'), defaultProjects); });
exports.getProjectsDB = getProjectsDB;
const getTeamsDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, node_1.JSONFilePreset)(path_1.default.join(DATA_DIR, 'teams.json'), defaultTeams);
    // Seed if empty
    if (db.data.members.length === 0 && db.data.teams.length === 0) {
        db.data.teams = initialTeams;
        db.data.members = [initialFacultyAdvisor, ...initialMembers];
        yield db.write();
        console.log('Seeded teams.json with initial data');
    }
    return db;
});
exports.getTeamsDB = getTeamsDB;
const getEventsDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, node_1.JSONFilePreset)(path_1.default.join(DATA_DIR, 'events.json'), defaultEvents);
    if (db.data.events.length === 0 && initialEvents.length > 0) {
        db.data.events = initialEvents;
        yield db.write();
        console.log('Seeded events.json with initial data');
    }
    return db;
});
exports.getEventsDB = getEventsDB;
