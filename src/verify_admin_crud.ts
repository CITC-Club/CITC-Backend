
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BASE_URL = 'http://localhost:5053/';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Mock Admin User
const mockAdmin = {
    id: 'admin-user-id',
    role: 'admin'
};

const adminToken = jwt.sign(mockAdmin, JWT_SECRET, { expiresIn: '1h' });

async function verifyAdminCRUD() {
    console.log('--- Starting Admin CRUD Verification ---');
    console.log('Admin Token Generated.');

    let userId = "";
    let eventId = "";

    // 1. Create User
    console.log('\n1. Creating a new User...');
    try {
        const response = await axios.post(`${BASE_URL}/users`, {
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            role: "member",
            rollNo: "123",
            semester: "V"
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('   SUCCESS:', response.data.id);
        userId = response.data.id;
    } catch (error: any) {
        console.error('   FAILED:', error.response?.data || error.message);
    }

    // 2. Get Users
    console.log('\n2. Listing Users...');
    try {
        const response = await axios.get(`${BASE_URL}/users`, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('   SUCCESS: Found', response.data.length, 'users');
    } catch (error: any) {
        console.error('   FAILED:', error.response?.data || error.message);
    }

    // 3. Update User
    if (userId) {
        console.log('\n3. Updating User...');
        try {
            const response = await axios.put(`${BASE_URL}/users/${userId}`, {
                name: "Updated Test User"
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('   SUCCESS:', response.data.name);
        } catch (error: any) {
            console.error('   FAILED:', error.response?.data || error.message);
        }
    }

    // 4. Create Event
    console.log('\n4. Creating Event...');
    try {
        const response = await axios.post(`${BASE_URL}/events`, {
            title: "Test Event",
            slug: "test-event",
            type: "workshop",
            year: 2025,
            status: "upcoming",
            date: "2025-01-01",
            startTime: "10:00",
            endTime: "12:00",
            location: "Hall A",
            mode: "physical",
            shortDescription: "Short desc",
            fullDescription: { about: "About", agenda: [], rules: [] },
            published: true,
            coverImage: "img.jpg",
            gallery: []
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('   SUCCESS:', response.data.id);
        eventId = response.data.id;
    } catch (error: any) {
        console.error('   FAILED:', error.response?.data || error.message);
    }

    // 5. Update Event
    if (eventId) {
        console.log('\n5. Updating Event...');
        try {
            const response = await axios.put(`${BASE_URL}/events/${eventId}`, {
                title: "Updated Test Event"
            }, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('   SUCCESS:', response.data.title);
        } catch (error: any) {
            console.error('   FAILED:', error.response?.data || error.message);
        }
    }

    // 6. Delete User & Event
    if (userId) {
        console.log('\n6. Deleting User...');
        try {
            await axios.delete(`${BASE_URL}/users/${userId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('   SUCCESS: User deleted');
        } catch (error: any) {
            console.error('   FAILED:', error.response?.data || error.message);
        }
    }

    if (eventId) {
        console.log('\n7. Deleting Event...');
        try {
            await axios.delete(`${BASE_URL}/events/${eventId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
            console.log('   SUCCESS: Event deleted');
        } catch (error: any) {
            console.error('   FAILED:', error.response?.data || error.message);
        }
    }
}

verifyAdminCRUD();
