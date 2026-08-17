import { groq } from './groq.client.js';

export class LLMService {
  static async generateBilingualResponse(userPrompt, context = '') {
    const systemPrompt = `You are a helpful, conversational voice assistant.
Context from documents:
"""
${context || 'No specific document context provided.'}
"""

Instructions:
1. Answer the question using ONLY the provided document context when available. If the context does not contain the answer, state that briefly.
2. Language Rules:
   - If the user speaks English, reply strictly in English.
   - If the user speaks Nepali (Devanagari or Romanized), reply in natural Nepali in standard Devanagari script.
   - If they mix both, reply in natural bilingual Nepali.
3. Voice constraints: Keep the response concise and natural (1 to 3 sentences maximum).`;

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 250,
    });

    return completion.choices[0].message.content.trim();
  }
}