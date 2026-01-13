import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import fs from 'fs';
import {
  UserSchema,
  ProjectSchema,
  TeamSchema,
  EventSchema,
  IEvent,
  IMember,
  ITeam,
} from './schema';

/* -------------------------------------------------------------------------- */
/*                                   Paths                                    */
/* -------------------------------------------------------------------------- */

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'db');
const MEDIA_DIR = path.join(ROOT, 'media');
const SOURCE_DATA_DIR = path.join(ROOT, 'src/data');

const DB_PATHS = {
  users: path.join(DATA_DIR, 'users.json'),
  projects: path.join(DATA_DIR, 'projects.json'),
  teams: path.join(DATA_DIR, 'teams.json'),
  events: path.join(DATA_DIR, 'events.json'),
};

/* -------------------------------------------------------------------------- */
/*                             Ensure Directories                              */
/* -------------------------------------------------------------------------- */

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(DATA_DIR);
ensureDir(MEDIA_DIR);

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const getTeamImagePath = (filename?: string, year?: number): string =>
  filename && year ? `/media/${year}/members/${filename}` : '';

function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`Failed to read ${filePath}`, err);
    return fallback;
  }
}

/* -------------------------------------------------------------------------- */
/*                             Initial Static Data                              */
/* -------------------------------------------------------------------------- */

const initialTeams: ITeam[] = [
  { id: 't_mentors_2025', name: 'Mentors', year: 2025 },
  { id: 't_exec_2025', name: 'Executive Committee', year: 2025 },
  { id: 't_faculty', name: 'Faculty Advisors', year: 2025 },
];

const teamsSeedData = readJSON<any>(
  path.join(SOURCE_DATA_DIR, 'teams.json'),
  { teamMembers: [], facultyAdvisor: {} }
);

const eventsSeedData = readJSON<any[]>(
  path.join(SOURCE_DATA_DIR, 'events.json'),
  []
);

/* -------------------------------------------------------------------------- */
/*                               Seed Builders                                 */
/* -------------------------------------------------------------------------- */

function buildFacultyAdvisor(): IMember {
  const fa = teamsSeedData.facultyAdvisor ?? {};

  return {
    id: 'fa1',
    name: fa.name || 'Er. Amit Shrivastava',
    type: 'Faculty Advisor',
    title: fa.title || 'Faculty Advisor',
    department: fa.department || 'HOD, Department of Computer Engineering',
    email: fa.email || 'hod.computer@ncit.edu.np',
    photo: getTeamImagePath(fa.image, 2025),
    year: 2025,
    member_year: 2025,
    teamId: 't_faculty',
  };
}

function buildMembers(): IMember[] {
  return teamsSeedData.teamMembers.map((m: any) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    year: m.year,
    member_year: m.member_year,
    photo: getTeamImagePath(m.image, m.member_year),
    socials: {
      github: m.github !== 'N/A' ? m.github : undefined,
      linkedin: m.linkedin !== 'N/A' ? m.linkedin : undefined,
      instagram:
        m.instagram !== 'N/A' && m.instagram !== 'Iksha Gurung insta'
          ? m.instagram
          : undefined,
    },
    type: 'Regular',
    semester:
      m.year === 4 ? 'VII/VIII' : m.year === 3 ? 'V/VI' : 'III/IV',
    teamId: m.year === 4 ? 't_mentors_2025' : 't_exec_2025',
  }));
}

function buildEvents(): IEvent[] {
  return eventsSeedData.map((e: any) => ({
    ...e,
    coverImage: `/media/${e.year}/events/${e.coverImage}`,
    gallery: e.gallery?.map(
      (img: string) => `/media/${e.year}/events/${img}`
    ),
  }));
}

/* -------------------------------------------------------------------------- */
/*                               DB Singletons                                 */
/* -------------------------------------------------------------------------- */

let usersDB: Awaited<ReturnType<typeof JSONFilePreset<UserSchema>>>;
let projectsDB: Awaited<ReturnType<typeof JSONFilePreset<ProjectSchema>>>;
let teamsDB: Awaited<ReturnType<typeof JSONFilePreset<TeamSchema>>>;
let eventsDB: Awaited<ReturnType<typeof JSONFilePreset<EventSchema>>>;

/* -------------------------------------------------------------------------- */
/*                             Initialization API                              */
/* -------------------------------------------------------------------------- */

export async function initDB() {
  usersDB = await JSONFilePreset<UserSchema>(DB_PATHS.users, { users: [] });
  projectsDB = await JSONFilePreset<ProjectSchema>(DB_PATHS.projects, { projects: [] });
  teamsDB = await JSONFilePreset<TeamSchema>(DB_PATHS.teams, { teams: [], members: [] });
  eventsDB = await JSONFilePreset<EventSchema>(DB_PATHS.events, { events: [] });

  await seedTeams();
  await seedEvents();

  console.log('LowDB initialized');
}

/* -------------------------------------------------------------------------- */
/*                                  Seeding                                    */
/* -------------------------------------------------------------------------- */

async function seedTeams() {
  if (teamsDB.data.teams.length > 0) return;

  teamsDB.data.teams = initialTeams;
  teamsDB.data.members = [
    buildFacultyAdvisor(),
    ...buildMembers(),
  ];

  await teamsDB.write();
  console.log('Seeded teams database');
}

async function seedEvents() {
  if (eventsDB.data.events.length > 0) return;

  eventsDB.data.events = buildEvents();
  await eventsDB.write();
  console.log('Seeded events database');
}

/* -------------------------------------------------------------------------- */
/*                               DB Accessors                                  */
/* -------------------------------------------------------------------------- */

export const getUsersDB = () => usersDB;
export const getProjectsDB = () => projectsDB;
export const getTeamsDB = () => teamsDB;
export const getEventsDB = () => eventsDB;
