import request from 'supertest';
import app from '../app';
import { getTeamsDB } from '../db/db';

// Mock the database module
jest.mock('../db/db', () => ({
    getTeamsDB: jest.fn(),
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

        const execTeam = res.body.teams.find((t: any) => t.id === 't_exec_2025');
        expect(execTeam).toBeDefined();

        const member1 = res.body.members.find((m: any) => m.name === 'Member 1');
        expect(member1).toBeDefined();
        expect(member1.teamId).toBe('t_exec_2025');
    });
});
