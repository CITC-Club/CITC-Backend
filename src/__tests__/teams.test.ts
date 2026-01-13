import request from 'supertest';
import app from '../app';
import { getTeamsDB } from '../db/db';

// Mock the database module
jest.mock('../db/db', () => ({
    getTeamsDB: jest.fn(),
}));

// Mock auth middleware
jest.mock('../middleware/auth', () => ({
    protect: (req: any, res: any, next: any) => {
        req.user = { id: 'admin_id', role: 'admin' };
        next();
    },
    authorize: (...roles: string[]) => (req: any, res: any, next: any) => {
        next();
    }
}));

describe('GET /api/team', () => {
    let mockDb: any;

    beforeEach(() => {
        mockDb = {
            data: {
                teams: [
                    { id: "t_mentors_2025", name: "Mentors", year: 2025 },
                    { id: "t_exec_2025", name: "Executive Committee", year: 2025 }
                ],
                members: [
                    {
                        id: 'm1',
                        name: 'Member 1',
                        teamId: 't_exec_2025',
                        year: 2025,
                        member_year: 2025, // Add missing property
                        photo: 'member1.jpg',
                        socials: { github: 'github.com/m1' }
                    },
                    {
                        id: 'm2',
                        name: 'Member 2',
                        teamId: 't_mentors_2025',
                        year: 2024,
                        member_year: 2024,
                        photo: '',
                        socials: {}
                    }
                ]
            },
            write: jest.fn().mockResolvedValue(undefined),
        };
        (getTeamsDB as jest.Mock).mockResolvedValue(mockDb);
    });

    it('should return teams and members', async () => {
        const res = await request(app).get('/api/team');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('teams');
        expect(res.body).toHaveProperty('members');
        expect(Array.isArray(res.body.teams)).toBe(true);
        expect(Array.isArray(res.body.members)).toBe(true);
    });
});

describe('POST /api/team', () => {
    let mockDb: any;

    beforeEach(() => {
        mockDb = {
            data: {
                members: []
            },
            write: jest.fn().mockResolvedValue(undefined),
        };
        (getTeamsDB as jest.Mock).mockResolvedValue(mockDb);
    });

    it('should create a new member with valid data', async () => {
        const newMember = {
            name: 'New Member',
            member_year: 2026,
            type: 'Executive',
            college_year: 3
        };

        const res = await request(app)
            .post('/api/team')
            .send(newMember);

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('New Member');
        expect(res.body.member_year).toBe(2026);
        expect(mockDb.data.members).toHaveLength(1);
    });

    it('should fail if required fields are missing', async () => {
        const incompleteMember = {
            name: 'Incomplete Member'
            // Missing member_year
        };

        const res = await request(app)
            .post('/api/team')
            .send(incompleteMember);

        expect(res.status).toBe(400);
    });
});
