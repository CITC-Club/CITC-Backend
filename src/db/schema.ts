/* -------------------------------------------------------------------------- */
/*                                   TEAM                                     */
/* -------------------------------------------------------------------------- */
export interface IMember {
    id: string;
    name: string;

    // Academic info
    college_year?: number;   // 1–4
    member_year?: number;    // e.g., 2025

    // Role info
    type: 'Executive' | 'Faculty Advisor' | 'Mentor' | 'Alumni';
    title?: string;

    // Contact info
    email?: string;
    photo?: string;

    socials?: {
        instagram?: string;
        linkedin?: string;
        github?: string;
        website?: string;
    };

    createdAt?: string;
    updatedAt?: string;
}

// Only store members for now
export interface TeamSchema {
    members: IMember[];
}


/* -------------------------------------------------------------------------- */
/*                                   EVENT                                    */
/* -------------------------------------------------------------------------- */

export interface IEvent {
    id: string;
    slug: string;
    title: string;

    type:
        | 'session'
        | 'workshop'
        | 'competition'
        | 'seminar'
        | 'webinar'
        | 'meeting'
        | 'social'
        | 'other';

    year: number;
    status: 'upcoming' | 'completed' | 'cancelled';

    date: string;       // YYYY-MM-DD
    startTime: string;  // HH:MM
    endTime: string;    // HH:MM

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
    gallery: string[];

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

/* -------------------------------------------------------------------------- */
/*                                   USER                                     */
/* -------------------------------------------------------------------------- */

export interface ILoginSession {
    sessionId: string;
    timestamp: string;
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    deviceInfo?: string;
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
    
    // Google OAuth
    googleId?: string;
    googleAccessToken?: string;
    googleRefreshToken?: string;
    
    // Login sessions tracking
    loginSessions?: ILoginSession[];

    createdAt: string;
    updatedAt: string;
}

export interface UserSchema {
    users: IUser[];
}

/* -------------------------------------------------------------------------- */
/*                                  PROJECT                                   */
/* -------------------------------------------------------------------------- */

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

export interface ProjectSchema {
    projects: IProject[];
}
