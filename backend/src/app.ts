import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import rfidRoutes from './routes/rfid.routes';
import studentRoutes from './routes/student.routes';
import locationRoutes from './routes/location.routes';
import leaderboardRoutes from './routes/leaderboard.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',        authRoutes);
app.use('/api/rfid',        rfidRoutes);
app.use('/api/students',    studentRoutes);
app.use('/api/locations',   locationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use(errorHandler as any);

export default app;
