import OpenAI from 'openai';
import { CONFIG } from '../config/env.js';

export const groqClient = new OpenAI({
  apiKey: CONFIG.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});