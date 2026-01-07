import express from 'express';

import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import projectRoutes from './routes/projectRoutes';
import teamRoutes from './routes/teamRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5053;

// Middlewar
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use('/media', express.static(path.join(__dirname, '../media')));

// Database Connection
// Database Connection removed (migrating to LowDB)
// import { initDB } from './db/db'; // Will be added later




// seedData(); // Removed for migration
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
