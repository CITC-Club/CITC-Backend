import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import Event from './models/Event';
import Project from './models/Project';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/citc_db';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        // Clear existing data
        await User.deleteMany({});
        await Event.deleteMany({});
        await Project.deleteMany({});

        console.log('Cleared existing data');

        // Create Admin/Patron
        const patronPassword = await bcrypt.hash('password123', 10);
        const patron = await User.create({
            name: 'Er. Amit Shrivatava',
            email: 'patron@citc.com',
            passwordHash: patronPassword,
            role: 'admin',
            isVerified: true,
        });

        // Create Mentors
        const mentorPassword = await bcrypt.hash('password123', 10);
        const mentor1 = await User.create({
            name: 'Mentor One',
            email: 'mentor1@citc.com',
            passwordHash: mentorPassword,
            role: 'mentor',
            isVerified: true,
        });
        const mentor2 = await User.create({
            name: 'Mentor Two',
            email: 'mentor2@citc.com',
            passwordHash: mentorPassword,
            role: 'mentor',
            isVerified: true,
        });

        // Create Members
        const memberPassword = await bcrypt.hash('password123', 10);
        const members = [];
        for (let i = 1; i <= 10; i++) {
            members.push({
                name: `Member ${i}`,
                email: `member${i}@citc.com`,
                passwordHash: memberPassword,
                role: 'member',
                rollNo: `CITC0${i}`,
                semester: '5th',
                isVerified: true,
            });
        }
        const createdMembers = await User.insertMany(members);

        // Create Events
        await Event.create({
            title: 'Tech Talk 2025',
            slug: 'tech-talk-2025',
            description: 'A deep dive into AI and Future Tech. Join industry experts as they discuss the latest trends in Artificial Intelligence, Machine Learning, and the future of technology.',
            startAt: new Date('2025-05-10T10:00:00'),
            endAt: new Date('2025-05-10T12:00:00'),
            location: 'Seminar Hall',
            capacity: 100,
            createdBy: patron._id,
        });

        await Event.create({
            title: 'Hackathon 1.0',
            slug: 'hackathon-1.0',
            description: '24-hour coding marathon. Build, innovate, and win exciting prizes. Open to all departments.',
            startAt: new Date('2025-06-15T09:00:00'),
            endAt: new Date('2025-06-16T09:00:00'),
            location: 'Computer Lab',
            capacity: 50,
            createdBy: mentor1._id,
        });

        await Event.create({
            title: 'Web Dev Workshop',
            slug: 'web-dev-workshop',
            description: 'Hands-on workshop on modern web development using React and Node.js. Perfect for beginners.',
            startAt: new Date('2025-07-20T11:00:00'),
            endAt: new Date('2025-07-20T16:00:00'),
            location: 'Lab 2',
            capacity: 30,
            createdBy: mentor2._id,
        });

        await Event.create({
            title: 'Robotics Bootcamp',
            slug: 'robotics-bootcamp',
            description: 'Learn to build and program your own robots. A 3-day intensive bootcamp for hardware enthusiasts.',
            startAt: new Date('2025-08-05T09:00:00'),
            endAt: new Date('2025-08-07T17:00:00'),
            location: 'Hardware Lab',
            capacity: 25,
            createdBy: mentor1._id,
        });

        // Create Projects
        await Project.create({
            title: 'Smart Campus',
            shortDesc: 'IoT based campus management.',
            longDesc: 'Full featured IoT solution for smart lights and attendance.',
            contributors: [createdMembers[0]._id, createdMembers[1]._id],
            repoUrl: 'https://github.com/citc/smart-campus',
            tags: ['IoT', 'Arduino', 'React'],
        });

        await Project.create({
            title: 'CITC Website',
            shortDesc: 'Official club website.',
            longDesc: 'MERN stack application for club management.',
            contributors: [createdMembers[2]._id],
            repoUrl: 'https://github.com/citc/website',
            tags: ['MERN', 'TypeScript', 'Docker'],
        });

        console.log('Seeding Completed Successfully');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
