import express from 'express';
import { getDb } from '../db/database.js';
import { forecastDemand, forecastAllProducts } from '../services/forecastEngine.js';

const router = express.Router();

// POST /api/forecast — forecast for a specific product
router.post('/', (req, res) => {
  try {
    const db = getDb();
    const { product_id, days = 7 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' });
    }

    const forecast = forecastDemand(db, product_id, days);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);

    res.json({
      product_id,
      product_name: product?.name,
      forecast,
      method: 'weighted_moving_average_with_seasonality',
      data_note: 'SIMULATED DEMO DATA — Algorithmic forecast from historical sales'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/forecast/all — forecast for all products (7 days)
router.get('/all', (req, res) => {
  try {
    const db = getDb();
    const forecasts = forecastAllProducts(db, 7);
    res.json({
      forecasts,
      generated_at: new Date().toISOString(),
      data_note: 'SIMULATED DEMO DATA'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
