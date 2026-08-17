import { Router } from 'express';
import { audioUpload } from '../config/multer.js';
import { VoiceController } from '../controllers/voice.controller.js';

const router = Router();

router.post('/process-voice', audioUpload.single('audio'), VoiceController.processVoiceInteraction);

export default router;