import express from 'express';
import cors from 'cors';
import voiceRoutes from './routes/voice.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Explicit CORS Configuration
app.use(
  cors({
    origin: ['http://localhost:2000'], // Your Next.js frontend URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-User-Transcript', 'X-AI-Transcript'], 
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/voice', voiceRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;