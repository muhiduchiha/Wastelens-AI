import express from 'express';
import { getDb } from '../db/database.js';
import { queryRAG } from '../services/ragService.js';

const router = express.Router();

// POST /api/rag/query
router.post('/query', async (req, res) => {
  try {
    const { query, category } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const result = await queryRAG(query, category || null);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rag/knowledge — list all knowledge base entries
router.get('/knowledge', (req, res) => {
  try {
    const db = getDb();
    const entries = db.prepare('SELECT id, category, title, source, created_at FROM market_knowledge ORDER BY category').all();
    res.json({ entries, count: entries.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
