"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("./models/User"));
const Event_1 = __importDefault(require("./models/Event"));
const Project_1 = __importDefault(require("./models/Project"));
const TeamMember_1 = __importDefault(require("./models/TeamMember"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/citc_db';
const seedData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(MONGO_URI);
        console.log('MongoDB Connected for Seeding');
        // Clear existing data
        yield User_1.default.deleteMany({});
        yield Event_1.default.deleteMany({});
        yield Project_1.default.deleteMany({});
        yield TeamMember_1.default.deleteMany({});
        console.log('Cleared existing data');
        // Create Admin User
        const adminPassword = yield bcryptjs_1.default.hash('admin123', 10);
        const admin = yield User_1.default.create({
            name: 'CITC Admin',
            email: 'admin@citc.ncit.edu.np',
            passwordHash: adminPassword,
            role: 'admin',
            isVerified: true,
        });
        console.log('Admin user created');
        // Create Patron/Mentor
        const patronPassword = yield bcryptjs_1.default.hash('password123', 10);
        const patron = yield User_1.default.create({
            name: 'Er. Amit Shrivatava',
            email: 'patron@citc.com',
            passwordHash: patronPassword,
            role: 'admin',
            isVerified: true,
        });
        // Create Mentors
        const mentorPassword = yield bcryptjs_1.default.hash('password123', 10);
        const mentor1 = yield User_1.default.create({
            name: 'Mentor One',
            email: 'mentor1@citc.com',
            passwordHash: mentorPassword,
            role: 'mentor',
            isVerified: true,
        });
        const mentor2 = yield User_1.default.create({
            name: 'Mentor Two',
            email: 'mentor2@citc.com',
            passwordHash: mentorPassword,
            role: 'mentor',
            isVerified: true,
        });
        // Create Members
        const memberPassword = yield bcryptjs_1.default.hash('password123', 10);
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
        const createdMembers = yield User_1.default.insertMany(members);
        // Seed Team Members
        const teamMembersData = [
            // Mentors
            {
                name: "Dr. Rajesh Kumar Shrestha",
                role: "Technical Mentor",
                category: "mentor",
                image: "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=2563eb&color=fff&size=256",
                bio: "Expert in Software Engineering and Cloud Computing with 15+ years of experience.",
                social: {
                    email: "rajesh.shrestha@ncit.edu.np",
                    linkedin: "https://linkedin.com/in/rajesh-shrestha",
                    github: "https://github.com/rajesh-shrestha"
                },
                order: 1,
                createdBy: admin._id
            },
            {
                name: "Prof. Anita Sharma",
                role: "Design Mentor",
                category: "mentor",
                image: "https://ui-avatars.com/api/?name=Anita+Sharma&background=2563eb&color=fff&size=256",
                bio: "UI/UX Design specialist and Human-Computer Interaction researcher.",
                social: {
                    email: "anita.sharma@ncit.edu.np",
                    linkedin: "https://linkedin.com/in/anita-sharma",
                    twitter: "https://twitter.com/anitasharma"
                },
                order: 2,
                createdBy: admin._id
            },
            {
                name: "Er. Bikash Thapa",
                role: "Industry Mentor",
                category: "mentor",
                image: "https://ui-avatars.com/api/?name=Bikash+Thapa&background=2563eb&color=fff&size=256",
                bio: "Senior Software Architect with expertise in full-stack development and DevOps.",
                social: {
                    email: "bikash.thapa@ncit.edu.np",
                    linkedin: "https://linkedin.com/in/bikash-thapa",
                    github: "https://github.com/bikash-thapa"
                },
                order: 3,
                createdBy: admin._id
            },
            // Executive Committee
            {
                name: "Krishna Prasad Acharya",
                role: "President",
                category: "executiveCommittee",
                image: "https://ui-avatars.com/api/?name=Abishek+Khadka&background=0ea5e9&color=fff&size=256",
                bio: "Leading CITC with a vision to foster innovation and technical excellence among students.",
                social: {
                    email: "abishek@citc.ncit.edu.np",
                    linkedin: "https://linkedin.com/in/abishek-khadka",
                    github: "https://github.com/abishek-khadka",
                    twitter: "https://twitter.com/abishekkhadka"
                },
                order: 1,
                createdBy: admin._id
            },
            {
                name: "Priya Maharjan",
                role: "Vice President",
                category: "executiveCommittee",
                image: "https://ui-avatars.com/api/?name=Priya+Maharjan&background=0ea5e9&color=fff&size=256",
                bio: "Passionate about organizing tech events and building a strong developer community.",
                social: {
                    email: "priya@citc.ncit.edu.np",
                    linkedin: "https://linkedin.com/in/priya-maharjan",
                    github: "https://github.com/priya-maharjan"
                },
                order: 2,
                createdBy: admin._id
            },
            {
                name: "Suman Tamang",
                role: "Secretary",
                category: "executiveCommittee",
                image: "https://ui-avatars.com/api/?name=Suman+Tamang&background=0ea5e9&color=fff&size=256",
                bio: "Ensuring smooth operations and effective communication within the club.",
                social: {
                    email: "suman@citc.ncit.edu.np",
                    linkedin: "https://linkedin.com/in/suman-tamang",
                    github: "https://github.com/suman-tamang"
                },
                order: 3,
                createdBy: admin._id
            },
            {
                name: "Kritika Shrestha",
                role: "Treasurer",
                category: "executiveCommittee",
                image: "https://ui-avatars.com/api/?name=Kritika+Shrestha&background=0ea5e9&color=fff&size=256",
                bio: "Managing club finances and ensuring transparent financial operations.",
                social: {
                    email: "kritika@citc.ncit.edu.np",
                    linkedin: "https://linkedin.com/in/kritika-shrestha"
                },
                order: 4,
                createdBy: admin._id
            },
            {
                name: "Rohan Adhikari",
                role: "Technical Lead",
                category: "executiveCommittee",
                image: "https://ui-avatars.com/api/?name=Rohan+Adhikari&background=0ea5e9&color=fff&size=256",
                bio: "Leading technical workshops and hackathons to enhance coding skills.",
                social: {
                    email: "rohan@citc.ncit.edu.np",
                    linkedin: "https://linkedin.com/in/rohan-adhikari",
                    github: "https://github.com/rohan-adhikari",
                    twitter: "https://twitter.com/rohanadhikari"
                },
                order: 5,
                createdBy: admin._id
            }
        ];
        yield TeamMember_1.default.insertMany(teamMembersData);
        console.log('Team members seeded');
        // Create Events with new fields
        const eventsData = [
            {
                title: 'Web Development Workshop',
                slug: 'web-development-workshop',
                description: 'Learn modern web development with React, TypeScript, and Tailwind CSS. Build a complete full-stack application from scratch with hands-on coding sessions.',
                type: 'workshop',
                startAt: new Date('2025-12-05T14:00:00.000Z'),
                endAt: new Date('2025-12-05T17:00:00.000Z'),
                location: 'NCIT Lab 301',
                capacity: 40,
                image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
                tags: ['web-development', 'react', 'typescript'],
                organizer: 'CITC Tech Team',
                createdBy: admin._id
            },
            {
                title: 'CITC Coding Challenge 2025',
                slug: 'citc-coding-challenge-2025',
                description: 'Test your algorithmic skills in our monthly coding challenge! Solve problems ranging from easy to hard and compete for exciting prizes.',
                type: 'coding-challenge',
                startAt: new Date('2025-12-10T10:00:00.000Z'),
                endAt: new Date('2025-12-10T13:00:00.000Z'),
                location: 'Online (CodeForces Platform)',
                capacity: 100,
                image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=400&fit=crop',
                tags: ['competitive-programming', 'algorithms', 'problem-solving'],
                organizer: 'CITC Competitive Programming Team',
                createdBy: admin._id
            },
            {
                title: 'AI & Machine Learning Bootcamp',
                slug: 'ai-ml-bootcamp',
                description: 'Dive deep into artificial intelligence and machine learning. Learn about neural networks, deep learning, and build your first ML model.',
                type: 'workshop',
                startAt: new Date('2025-12-15T09:00:00.000Z'),
                endAt: new Date('2025-12-15T16:00:00.000Z'),
                location: 'NCIT Auditorium',
                capacity: 50,
                image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
                tags: ['ai', 'machine-learning', 'python'],
                organizer: 'CITC AI Research Group',
                createdBy: admin._id
            },
            {
                title: 'HackNCIT 2025 - 24hr Hackathon',
                slug: 'hackncit-2025',
                description: 'Join Nepal\'s biggest student hackathon! Build innovative solutions to real-world problems in 24 hours. Amazing prizes and networking opportunities await!',
                type: 'hackathon',
                startAt: new Date('2025-12-20T08:00:00.000Z'),
                endAt: new Date('2025-12-21T08:00:00.000Z'),
                location: 'NCIT Campus',
                capacity: 120,
                image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop',
                tags: ['hackathon', 'innovation', 'team-building'],
                organizer: 'CITC Events Team',
                createdBy: admin._id
            },
            {
                title: 'Tech Talk: Cloud Computing & DevOps',
                slug: 'tech-talk-cloud-devops',
                description: 'Industry experts share insights on cloud computing, containerization, CI/CD pipelines, and modern DevOps practices.',
                type: 'tech-talk',
                startAt: new Date('2025-12-12T16:00:00.000Z'),
                endAt: new Date('2025-12-12T18:00:00.000Z'),
                location: 'NCIT Seminar Hall',
                capacity: 80,
                image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop',
                tags: ['cloud', 'devops', 'docker', 'kubernetes'],
                organizer: 'CITC Industry Connect',
                createdBy: admin._id
            }
        ];
        yield Event_1.default.insertMany(eventsData);
        console.log('Events seeded');
        // Create Projects
        yield Project_1.default.create({
            title: 'Smart Campus',
            shortDesc: 'IoT based campus management.',
            longDesc: 'Full featured IoT solution for smart lights and attendance.',
            contributors: [createdMembers[0]._id, createdMembers[1]._id],
            repoUrl: 'https://github.com/citc/smart-campus',
            tags: ['IoT', 'Arduino', 'React'],
        });
        yield Project_1.default.create({
            title: 'CITC Website',
            shortDesc: 'Official club website.',
            longDesc: 'MERN stack application for club management.',
            contributors: [createdMembers[2]._id],
            repoUrl: 'https://github.com/citc/website',
            tags: ['MERN', 'TypeScript', 'Docker'],
        });
        console.log('Seeding Completed Successfully');
        console.log('\n=== Admin Credentials ===');
        console.log('Email: admin@citc.ncit.edu.np');
        console.log('Password: admin123');
        console.log('========================\n');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
});
exports.seedData = seedData;
