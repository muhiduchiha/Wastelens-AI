import './polyfill.js';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initDb } from './db/database.js';
import dashboardRouter from './routes/dashboard.js';
import inventoryRouter from './routes/inventory.js';
import forecastRouter from './routes/forecast.js';
import agentsRouter from './routes/agents.js';
import pricingRouter from './routes/pricing.js';
import simulationRouter from './routes/simulation.js';
import ragRouter from './routes/rag.js';
import visionRouter from './routes/vision.js';
import eventsRouter from './routes/events.js';
import copilotRouter from './routes/copilot.js';
import { startEventStream } from './services/eventStream.js';
import { keyPool } from './services/geminiService.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow all origins for production/Railway
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static client build serving for Railway/Production
const clientDist = join(__dirname, '../../../client/dist');
const altClientDist = join(__dirname, '../../client/dist');
const distPath = fs.existsSync(clientDist) ? clientDist : (fs.existsSync(altClientDist) ? altClientDist : null);

if (distPath) {
  console.log(`📦 Serving static frontend from: ${distPath}`);
  app.use(express.static(distPath));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'WASTELENS AI Backend' });
});

// Routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/forecast', forecastRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/simulation', simulationRouter);
app.use('/api/rag', ragRouter);
app.use('/api/vision', visionRouter);
app.use('/api/events', eventsRouter);
app.use('/api/copilot', copilotRouter);

// SPA fallback for React Router (non-API routes)
if (distPath) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(join(distPath, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

// Initialize DB and start server
initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 WASTELENS AI Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
    const keyCount = keyPool.keys.length;
    console.log(`🤖 Gemini API Pool: ${keyCount > 0 ? `✅ ${keyCount} Key(s) Configured (Auto-Failover & Rotation)` : '⚠️  Not configured (using fallback)'}\n`);
    // Start simulated real-time event stream
    startEventStream();
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

export { server };
