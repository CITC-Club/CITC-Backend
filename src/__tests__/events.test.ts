import request from 'supertest';
import app from '../app';
import { getEventsDB } from '../db/db';

// Mock the database module
jest.mock('../db/db', () => ({
    getEventsDB: jest.fn(),
}));

describe('GET /api/events', () => {
    let mockDb: any;

    beforeEach(() => {
        // Reset mocks and setup default db state
        mockDb = {
            data: {
                events: [
                    {
                        id: '1',
                        title: 'Event 1',
                        date: '2025-01-01',
                        status: 'upcoming',
                        published: true,
                        year: 2025,
                        type: 'workshop',
                        slug: 'event-1'
                    },
                    {
                        id: '2',
                        title: 'Event 2',
                        date: '2024-01-01',
                        status: 'completed',
                        published: true,
                        year: 2024,
                        type: 'seminar',
                        slug: 'event-2'
                    },
                    {
                        id: '3',
                        title: 'Unpublished Event',
                        date: '2025-02-01',
                        status: 'upcoming',
                        published: false,
                        year: 2025,
                        type: 'workshop',
                        slug: 'unpublished-event'
                    }
                ],
            },
            write: jest.fn().mockResolvedValue(undefined),
        };
        (getEventsDB as jest.Mock).mockResolvedValue(mockDb);
    });

    it('should return a list of published events', async () => {
        const res = await request(app).get('/api/events');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2); // Should only have published events
        expect(res.body.find((e: any) => e.id === '3')).toBeUndefined();
    });

    it('should filter events by year', async () => {
        const res = await request(app).get('/api/events?year=2024');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].year).toBe(2024);
    });

    it('should filter events by type', async () => {
        const res = await request(app).get('/api/events?type=workshop');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1); // Only Event 1 is published and workshop
        expect(res.body[0].type).toBe('workshop');
    });

    it('should filter events by status', async () => {
        const res = await request(app).get('/api/events?status=upcoming');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].status).toBe('upcoming');
    });
});
