export interface IMember {
    id: string;
    name: string;
    teamId?: string;
    year?: number;
    member_year?: number;
    photo?: string;
    semester?: string;
    type: 'Regular' | 'Faculty Advisor';
    title?: string;
    department?: string;
    email?: string;
    socials?: {
        instagram?: string;
        linkedin?: string;
        github?: string;
    }
}

export interface ITeam {
    id: string;
    name: string;
    year: number;
}

export interface TeamSchema {
    teams: ITeam[];
    members: IMember[];
}

export interface IEvent {
    id: string;
    slug: string;
    title: string;
    type: 'session' | 'workshop' | 'competition' | 'seminar' | 'webinar' | 'meeting' | 'social' | 'other';
    year: number;
    status: 'upcoming' | 'completed' | 'cancelled';
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    location: string;
    mode: 'physical' | 'online' | 'hybrid';

    shortDescription: string;

    fullDescription: {
        about: string;
        agenda: string[] | null;
        rules: string[] | null;
    };

    competitionDetails: {
        eligibility: string;
        teamSize: string;
        prizes: string[];
    } | null;

    coverImage: string;
    gallery: string[]; // empty for upcoming

    outcomes: {
        summary: string;
        highlights: string[];
    } | null;

    published: boolean;

    createdAt?: string;
    updatedAt?: string;
}

export interface EventSchema {
    events: IEvent[];
}

export interface IUser {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    rollNo?: string;
    semester?: string;
    role: 'admin' | 'mentor' | 'member' | 'guest';
    isVerified: boolean;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IProject {
    id: string;
    title: string;
    shortDesc: string;
    longDesc: string;
    contributors: string[];
    repoUrl?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface UserSchema {
    users: IUser[];
}

export interface ProjectSchema {
    projects: IProject[];
}
