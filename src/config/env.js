import dotenv from 'dotenv';
dotenv.config({ override: true });

if (!process.env.GROQ_API_KEY) {
  console.error('FATAL ERROR: GROQ_API_KEY is not defined in .env');
  process.exit(1);
}

export const CONFIG = {
  PORT: process.env.PORT || 3000,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
};