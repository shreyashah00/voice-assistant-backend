import express from 'express';
import cors from 'cors';
import voiceRoutes from './routes/voice.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

import { configDotenv } from 'dotenv';

const app = express();
configDotenv();
// Explicit CORS Configuration
const allowedOrigins = process.env.AllowedOrigins
  ? process.env.AllowedOrigins.split(',').map(origin => origin.trim().replace(/\/$/, ''))
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, or server-to-server)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*') || allowedOrigins.length === 0) {
        callback(null, true);
      } else {
        console.warn(`Blocked by CORS: origin ${origin} not in allowed list [${allowedOrigins.join(', ')}]`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-User-Transcript', 'X-AI-Transcript'], 
    credentials: true,
  })
);
console.log('Allowed Origins:', allowedOrigins);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/voice', voiceRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;