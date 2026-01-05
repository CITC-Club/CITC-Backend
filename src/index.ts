import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import projectRoutes from './routes/projectRoutes';
import teamRoutes from './routes/teamRoutes';
import { seedData } from './seed';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5053;

// Middlewar
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/citc_db';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));


    
seedData();
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/team', teamRoutes);

app.get('/', (req, res) => {
    res.send('CITC API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
