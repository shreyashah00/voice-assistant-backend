import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export class RAGService {
  static knowledgeBase = []; // Holds { text }

  // Tokenize text into lowercase words supporting English and Devanagari (Nepali)
  static tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1);
  }

  // Calculate cosine similarity between query and chunk term frequency vectors
  static calculateScore(queryTokens, chunkText) {
    const chunkTokens = this.tokenize(chunkText);
    if (chunkTokens.length === 0) return 0;

    const queryFreq = {};
    const chunkFreq = {};

    queryTokens.forEach(token => {
      queryFreq[token] = (queryFreq[token] || 0) + 1;
    });

    chunkTokens.forEach(token => {
      chunkFreq[token] = (chunkFreq[token] || 0) + 1;
    });

    const allTokens = new Set([...Object.keys(queryFreq), ...Object.keys(chunkFreq)]);

    let dotProduct = 0;
    let queryNorm = 0;
    let chunkNorm = 0;

    allTokens.forEach(token => {
      const q = queryFreq[token] || 0;
      const c = chunkFreq[token] || 0;
      dotProduct += q * c;
      queryNorm += q * q;
      chunkNorm += c * c;
    });

    if (queryNorm === 0 || chunkNorm === 0) return 0;
    return dotProduct / (Math.sqrt(queryNorm) * Math.sqrt(chunkNorm));
  }

  // Split PDF/Text into chunks and index them
  static async indexDocument(filePath) {
    let text = '';

    if (filePath.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else {
      text = fs.readFileSync(filePath, 'utf-8');
    }

    // Split text into chunks (~500 characters each)
    const rawChunks = text.match(/[\s\S]{1,500}/g) || [];
    this.knowledgeBase = [];

    console.log(`Indexing ${rawChunks.length} chunks into local vector store...`);

    for (const chunk of rawChunks) {
      const trimmed = chunk.trim();
      if (trimmed.length > 0) {
        this.knowledgeBase.push({
          text: trimmed,
        });
      }
    }

    console.log('Document successfully indexed in memory.');
  }

  // Find top matching chunks for user query
  static async retrieveRelevantContext(query, topK = 3) {
    if (this.knowledgeBase.length === 0) {
      return '';
    }

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) {
      return this.knowledgeBase.slice(0, topK).map(item => item.text).join('\n---\n');
    }

    // Calculate score for each chunk
    const scoredChunks = this.knowledgeBase.map((item) => ({
      text: item.text,
      score: this.calculateScore(queryTokens, item.text),
    }));

    // Sort by highest similarity
    scoredChunks.sort((a, b) => b.score - a.score);

    // Take top K results (preferring non-zero matches if available)
    const matches = scoredChunks.filter(c => c.score > 0);
    const topMatches = matches.length > 0 ? matches.slice(0, topK) : scoredChunks.slice(0, topK);

    return topMatches.map((match) => match.text).join('\n---\n');
  }
}