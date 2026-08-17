import * as googleTTS from 'google-tts-api';

export class TTSService {
  static async synthesizeSpeech(text) {
    if (!text || text.trim().length === 0) {
      return Buffer.alloc(0);
    }

    // Automatically detect Nepali vs English by checking for Devanagari characters
    const isNepali = /[\u0900-\u097F]/.test(text);
    const lang = isNepali ? 'ne' : 'en';

    // Google Translate TTS has a 200-character limit per request.
    // We split the response into sentences or phrases.
    const sentences = text.match(/[^.!?।]+[.!?।]*/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > 180) {
        if (currentChunk.trim().length > 0) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    // Synthesize each chunk and concatenate buffers
    const buffers = [];
    for (const chunk of chunks) {
      try {
        const base64 = await googleTTS.getAudioBase64(chunk, {
          lang,
          slow: false,
          host: 'https://translate.google.com',
          timeout: 10000,
        });
        buffers.push(Buffer.from(base64, 'base64'));
      } catch (err) {
        console.error(`Failed to synthesize TTS chunk: "${chunk}"`, err);
      }
    }

    if (buffers.length === 0) {
      throw new Error('TTS synthesis failed for all chunks.');
    }

    return Buffer.concat(buffers);
  }
}
