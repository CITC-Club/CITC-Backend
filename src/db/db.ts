import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import fs from 'fs';
import {
  UserSchema,
  ProjectSchema,
  TeamSchema,
  EventSchema,
} from './schema';

/* -------------------------------------------------------------------------- */
/*                                   Paths                                    */
/* -------------------------------------------------------------------------- */

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'db');

const DB_PATHS = {
  users: path.join(DATA_DIR, 'users.json'),
  projects: path.join(DATA_DIR, 'projects.json'),
  teams: path.join(DATA_DIR, 'teams.json'),
  events: path.join(DATA_DIR, 'events.json'),
};

/* -------------------------------------------------------------------------- */
/*                             Ensure DB Directory                             */
/* -------------------------------------------------------------------------- */

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(DATA_DIR);

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
  teamsDB = await JSONFilePreset<TeamSchema>(DB_PATHS.teams, { members: [] });
  eventsDB = await JSONFilePreset<EventSchema>(DB_PATHS.events, { events: [] });

  console.log('LowDB initialized (no seeding)');
}

/* -------------------------------------------------------------------------- */
/*                               DB Accessors                                  */
/* -------------------------------------------------------------------------- */

export const getUsersDB = () => usersDB;
export const getProjectsDB = () => projectsDB;
export const getTeamsDB = () => teamsDB;
export const getEventsDB = () => eventsDB;
