import app from './app.js';
import { CONFIG } from './config/env.js';
import { RAGService } from './services/rag.service.js';
import path from 'path';
import fs from 'fs';

const startServer = async () => {
  try {
    // Index your PDF or text file on server startup
    const sampleDocPath = path.resolve('knowledge_base.txt'); // or .pdf
    if (fs.existsSync(sampleDocPath)) {
      await RAGService.indexDocument(sampleDocPath);
    } else {
      console.warn(`Warning: Knowledge base file not found at ${sampleDocPath}. Skipping document indexing on startup.`);
    }

    app.listen(CONFIG.PORT, () => {
      console.log(`Backend server running at: http://localhost:${CONFIG.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();