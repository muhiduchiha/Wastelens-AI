import express from 'express';
import { runCopilot } from '../services/copilotService.js';

const router = express.Router();

// POST /api/copilot/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, previous_interaction_id } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const result = await runCopilot(message, previous_interaction_id);
    res.json(result);
  } catch (err) {
    console.error('Copilot error:', err);
    res.status(500).json({ error: err.message, fallback: true });
  }
});

export default router;
