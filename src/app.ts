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
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(cors({

    origin: "http://localhost:5173",
    credentials: true
}
));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use('/media', express.static(path.join(__dirname, '../media')));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('CITC API is running');
});

export default app;
