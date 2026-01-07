import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import fs from 'fs';
import { UserSchema, ProjectSchema, TeamSchema, EventSchema, IEvent, IUser, IProject, ITeamMember } from './schema';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const EVENTS_DIR = path.join(DATA_DIR, 'events');
const TEAMS_DIR = path.join(DATA_DIR, 'teams'); // Although teams is one file, keeping consistent path logic

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(EVENTS_DIR)) fs.mkdirSync(EVENTS_DIR);
if (!fs.existsSync(TEAMS_DIR)) fs.mkdirSync(TEAMS_DIR);

// Initialize DBs with default data
const defaultUsers: UserSchema = { users: [] };
const defaultProjects: ProjectSchema = { projects: [] };
const defaultTeams: TeamSchema = { teams: [] };

// Singleton instances for static files
export const getUsersDB = async () => await JSONFilePreset<UserSchema>(path.join(DATA_DIR, 'users.json'), defaultUsers);
export const getProjectsDB = async () => await JSONFilePreset<ProjectSchema>(path.join(DATA_DIR, 'projects.json'), defaultProjects);
export const getTeamsDB = async () => await JSONFilePreset<TeamSchema>(path.join(TEAMS_DIR, 'teams.json'), defaultTeams);

// Dynamic loader for events (partitioned by year)
export const getEventsDB = async (year: string) => {
    const filePath = path.join(EVENTS_DIR, `${year}.json`);
    const defaultEvents: EventSchema = { events: [] };
    return await JSONFilePreset<EventSchema>(filePath, defaultEvents);
};

// Helper to get all events (aggregating years) - optional, for 'getAll' logic
export const getAllEvents = async () => {
    const files = fs.readdirSync(EVENTS_DIR).filter(f => f.endsWith('.json'));
    let allEvents: IEvent[] = [];
    for (const file of files) {
        const db = await JSONFilePreset<EventSchema>(path.join(EVENTS_DIR, file), { events: [] });
        allEvents = [...allEvents, ...db.data.events];
    }
    return allEvents;
};
