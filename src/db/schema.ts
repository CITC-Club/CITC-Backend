export interface IEvent {
    id: string;
    title: string;
    slug: string;
    description: string;
    type: 'workshop' | 'hackathon' | 'tech-talk' | 'coding-challenge';
    startAt: string; // Dates stored as strings in JSON
    endAt: string;
    location: string;
    capacity: number;
    image?: string;
    tags: string[];
    organizer?: string;
    attachments: string[];
    attendees: string[]; // User IDs
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface ITeamMember {
    id: string;
    name: string;
    role: string;
    category: 'mentor' | 'executiveCommittee';
    image?: string;
    bio?: string;
    social?: {
        email?: string;
        linkedin?: string;
        github?: string;
        twitter?: string;
    };
    order: number;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
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
    contributors: string[]; // User IDs
    repoUrl?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

// Schemas for individual files
export interface UserSchema {
    users: IUser[];
}

export interface ProjectSchema {
    projects: IProject[];
}

export interface TeamSchema {
    teams: ITeamMember[];
}

export interface EventSchema {
    events: IEvent[]; // This will be the structure for years/2026.json etc.
}
