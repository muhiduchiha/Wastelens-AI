import express from 'express';
import { runSimulation } from '../services/simulationEngine.js';

const router = express.Router();

// POST /api/simulation/run
router.post('/run', async (req, res) => {
  try {
    const config = req.body || {};
    const result = await runSimulation(config);
    res.json(result);
  } catch (err) {
    console.error('Simulation error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
