import fs from 'fs';
import { groq } from './groq.client.js';

export class STTService {
  static async transcribeAudio(filePath) {
    const audioReadStream = fs.createReadStream(filePath);
    const transcription = await groq.audio.transcriptions.create({
      file: audioReadStream,
      model: 'whisper-large-v3',
    });
    return transcription.text?.trim();
  }
}