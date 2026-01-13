import request from 'supertest';
import app from '../app';
import { getUsersDB } from '../db/db';
import { OAuth2Client } from 'google-auth-library';

// Mock dependencies
jest.mock('../db/db');
jest.mock('google-auth-library');

describe('POST /api/auth/google-login', () => {
    let mockDb: any;
    let mockVerifyIdToken: jest.Mock;

    beforeEach(() => {
        // Setup mock DB
        mockDb = {
            data: {
                users: []
            },
            write: jest.fn().mockResolvedValue(undefined)
        };
        (getUsersDB as jest.Mock).mockResolvedValue(mockDb);

        // Setup mock Google Client
        mockVerifyIdToken = jest.fn();
        (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({
            verifyIdToken: mockVerifyIdToken
        }));
    });

    it('should return 400 if idToken is missing', async () => {
        const res = await request(app)
            .post('/api/auth/google-login')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('ID token required');
    });

    it('should return 401 if Google token is invalid', async () => {
        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => null
        });

        const res = await request(app)
            .post('/api/auth/google-login')
            .send({ idToken: 'invalid_token' });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid Google token');
    });

    it('should return 401 if email is not verified', async () => {
        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => ({
                sub: '123',
                email: 'test@ncit.edu.np',
                email_verified: false,
                hd: 'ncit.edu.np'
            })
        });

        const res = await request(app)
            .post('/api/auth/google-login')
            .send({ idToken: 'valid_token' });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Email not verified');
    });

    // it('should return 403 if email domain is not ncit.edu.np', async () => {
    //     mockVerifyIdToken.mockResolvedValue({
    //         getPayload: () => ({
    //             sub: '123',
    //             email: 'test@gmail.com',
    //             email_verified: true,
    //             hd: 'gmail.com'
    //         })
    //     });
    //
    //     const res = await request(app)
    //         .post('/api/auth/google-login')
    //         .send({ idToken: 'valid_token' });
    //
    //     expect(res.status).toBe(403);
    //     expect(res.body.message).toBe('Only @ncit.edu.np accounts are allowed');
    // });

    it('should register first user as ADMIN', async () => {
        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => ({
                sub: 'google_123',
                email: 'admin@ncit.edu.np',
                name: 'Admin User',
                picture: 'pic.jpg',
                email_verified: true,
                hd: 'ncit.edu.np'
            })
        });

        const res = await request(app)
            .post('/api/auth/google-login')
            .send({ idToken: 'valid_token' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.role).toBe('admin');
        expect(mockDb.data.users).toHaveLength(1);
        expect(mockDb.data.users[0].role).toBe('admin');
    });

    it('should register subsequent users as GUEST', async () => {
        // Pre-populate DB with an admin
        mockDb.data.users.push({
            id: 'admin_id',
            role: 'admin',
            email: 'admin@ncit.edu.np'
        });

        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => ({
                sub: 'google_456',
                email: 'guest@ncit.edu.np',
                name: 'Guest User',
                picture: 'pic.jpg',
                email_verified: true,
                hd: 'ncit.edu.np'
            })
        });

        const res = await request(app)
            .post('/api/auth/google-login')
            .send({ idToken: 'valid_token' });

        expect(res.status).toBe(200);
        expect(res.body.role).toBe('guest');
        expect(mockDb.data.users).toHaveLength(2);
        expect(mockDb.data.users[1].role).toBe('guest');
    });

    it('should login existing user', async () => {
        // Pre-populate DB
        mockDb.data.users.push({
            id: 'existing_id',
            name: 'Existing User',
            email: 'existing@ncit.edu.np',
            role: 'member',
            avatarUrl: 'old_pic.jpg',
            googleId: 'google_old'
        });

        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => ({
                sub: 'google_new',
                email: 'existing@ncit.edu.np',
                name: 'Existing User Updated',
                picture: 'new_pic.jpg',
                email_verified: true,
                hd: 'ncit.edu.np'
            })
        });

        const res = await request(app)
            .post('/api/auth/google-login')
            .send({ idToken: 'valid_token' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        // Should update user details
        expect(mockDb.data.users[0].avatarUrl).toBe('new_pic.jpg');
        expect(mockDb.data.users[0].googleId).toBe('google_new');
    });
});
