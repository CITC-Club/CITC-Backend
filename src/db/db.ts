import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import fs from 'fs';
import { UserSchema, ProjectSchema, TeamSchema, EventSchema, IEvent, IUser, IProject, IMember, ITeam } from './schema';

const DATA_DIR = path.resolve(process.cwd(), 'db');
const MEDIA_DIR = path.resolve(process.cwd(), 'media');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });

// Initial Teams
const initialTeams: ITeam[] = [
    { id: "t_mentors_2025", name: "Mentors", year: 2025 },
    { id: "t_exec_2025", name: "Executive Committee", year: 2025 },
    { id: "t_faculty", name: "Faculty Advisors", year: 2025 }
];

// Helpers
const getTeamImagePath = (filename: string, year: number): string => {
    if (!filename) return "";
    return `/media/${year}/members/${filename}`;
};

const getMemberYearFromEmail = (email: string): number => {
    // Extract the batch part from email (e.g., 22 from manash.221224)
    const match = email.match(/\.(\d{2})\d{4}@/);
    if (match && match[1]) {
        return 2000 + parseInt(match[1]);
    }
    return 2024;
};

// Read initial data from JSON file
const teamsDataPath = path.resolve(process.cwd(), 'src/data/teams.json');
let teamsData: any = { teamMembers: [], facultyAdvisor: {} };

try {
    if (fs.existsSync(teamsDataPath)) {
        const fileContent = fs.readFileSync(teamsDataPath, 'utf-8');
        teamsData = JSON.parse(fileContent);
    } else {
        console.warn(`Teams data file not found at ${teamsDataPath}`);
    }
} catch (error) {
    console.error("Error reading teams.json:", error);
}

// Read events data from JSON file
const eventsDataPath = path.resolve(process.cwd(), 'src/data/events.json');
let eventsData: any[] = [];

try {
    if (fs.existsSync(eventsDataPath)) {
        const fileContent = fs.readFileSync(eventsDataPath, 'utf-8');
        eventsData = JSON.parse(fileContent);
    } else {
        console.warn(`Events data file not found at ${eventsDataPath}`);
    }
} catch (error) {
    console.error("Error reading events.json:", error);
}

const initialFacultyAdvisor: IMember = {
    id: "fa1",
    name: teamsData.facultyAdvisor?.name || "Er. Amit Shrivastava",
    type: "Faculty Advisor",
    title: teamsData.facultyAdvisor?.title || "Faculty Advisor",
    department: teamsData.facultyAdvisor?.department || "HOD, Department of Computer Engineering",
    email: teamsData.facultyAdvisor?.email || "hod.computer@ncit.edu.np",
    photo: getTeamImagePath(teamsData.facultyAdvisor?.image, 2025), // Defaulting to 2025 as not in JSON
    year: 2025,
    member_year: 2025,
    teamId: "t_faculty"
};

const initialMembers: IMember[] = teamsData.teamMembers.map((m: any) => ({
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
const initialEvents: IEvent[] = eventsData.map((e: any) => ({
    ...e,
    coverImage: `/media/${e.year}/events/${e.coverImage}`, // Assuming event images are in year/events/
    gallery: e.gallery?.map((img: string) => `/media/${e.year}/events/${img}`)
}));

// Initialize DBs with default data
const defaultUsers: UserSchema = { users: [] };
const defaultProjects: ProjectSchema = { projects: [] };
const defaultTeams: TeamSchema = { teams: [], members: [] };
const defaultEvents: EventSchema = { events: [] };

// Singleton instances
export const getUsersDB = async () => await JSONFilePreset<UserSchema>(path.join(DATA_DIR, 'users.json'), defaultUsers);
export const getProjectsDB = async () => await JSONFilePreset<ProjectSchema>(path.join(DATA_DIR, 'projects.json'), defaultProjects);

export const getTeamsDB = async () => {
    const db = await JSONFilePreset<TeamSchema>(path.join(DATA_DIR, 'teams.json'), defaultTeams);

    // Seed if empty
    if (db.data.members.length === 0 && db.data.teams.length === 0) {
        db.data.teams = initialTeams;
        db.data.members = [initialFacultyAdvisor, ...initialMembers];
        await db.write();
        console.log('Seeded teams.json with initial data');
    }

    return db;
};

export const getEventsDB = async () => {
    const db = await JSONFilePreset<EventSchema>(path.join(DATA_DIR, 'events.json'), defaultEvents);

    if (db.data.events.length === 0 && initialEvents.length > 0) {
        db.data.events = initialEvents;
        await db.write();
        console.log('Seeded events.json with initial data');
    }

    return db;
};
