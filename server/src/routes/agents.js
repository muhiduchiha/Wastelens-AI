import express from 'express';
import { getDb } from '../db/database.js';
import { runAllAgents } from '../services/agentOrchestrator.js';

const router = express.Router();

// POST /api/agents/run — run all AI agents
router.post('/run', async (req, res) => {
  try {
    const db = getDb();
    const result = await runAllAgents(db);
    res.json(result);
  } catch (err) {
    console.error('Agent run error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/agents/decisions — get recent agent decisions
router.get('/decisions', (req, res) => {
  try {
    const db = getDb();
    const decisions = db.prepare(`
      SELECT * FROM agent_decisions
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    res.json({
      decisions: decisions.map(d => ({
        ...d,
        input_data: d.input_data ? JSON.parse(d.input_data) : null,
        output_data: d.output_data ? JSON.parse(d.output_data) : null,
      })),
      count: decisions.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
