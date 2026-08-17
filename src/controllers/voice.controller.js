import fs from 'fs';
import { STTService } from '../services/stt.service.js';
import { RAGService } from '../services/rag.service.js';
import { LLMService } from '../services/llm.service.js';
import { TTSService } from '../services/tts.service.js';

export class VoiceController {
  static async processVoiceInteraction(req, res, next) {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ success: false, message: 'Audio file is required.' });
    }

    try {
      // 1. Audio -> Text
      const userTranscript = await STTService.transcribeAudio(audioFile.path);

      if (!userTranscript) {
        return res.status(422).json({ success: false, message: 'No audible speech detected.' });
      }

      // 2. Query -> Retrieve Document Context (RAG)
      const context = await RAGService.retrieveRelevantContext(userTranscript);

      // 3. Text + Context -> Answer
      const aiResponseText = await LLMService.generateBilingualResponse(userTranscript, context);
      const finalResponseText = aiResponseText?.trim() || 'I am sorry, could you please repeat that?';

      // 4. Answer -> Voice Audio
      const audioBuffer = await TTSService.synthesizeSpeech(finalResponseText);

      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('TTS Service produced an empty audio buffer.');
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Access-Control-Expose-Headers', 'X-User-Transcript, X-AI-Transcript');
      res.setHeader('X-User-Transcript', encodeURIComponent(userTranscript));
      res.setHeader('X-AI-Transcript', encodeURIComponent(finalResponseText));

      return res.status(200).send(audioBuffer);
    } catch (error) {
      next(error);
    } finally {
      if (audioFile && fs.existsSync(audioFile.path)) {
        fs.unlink(audioFile.path, (err) => {
          if (err) console.error('Failed to remove temp file:', err);
        });
      }
    }
  }
}