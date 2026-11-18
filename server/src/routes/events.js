import express from 'express';
import { getEventClients, addEventClient } from '../services/eventStream.js';

const router = express.Router();

// GET /api/events — SSE stream
router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.flushHeaders();

  const clientId = addEventClient(res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'WASTELENS AI Event Stream Connected', timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    const clients = getEventClients();
    const idx = clients.indexOf(res);
    if (idx !== -1) clients.splice(idx, 1);
  });
});

export default router;
