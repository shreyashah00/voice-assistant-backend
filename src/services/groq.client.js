import Groq from 'groq-sdk';
import { CONFIG } from '../config/env.js';

export const groq = new Groq({
  apiKey: CONFIG.GROQ_API_KEY,
});
