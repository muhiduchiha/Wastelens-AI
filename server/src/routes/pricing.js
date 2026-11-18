import express from 'express';
import { getDb } from '../db/database.js';
import { generatePricingRecommendation, recommendAllDiscounts } from '../services/pricingEngine.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// POST /api/pricing/recommend — generate discount recommendation for one product
router.post('/recommend', async (req, res) => {
  try {
    const db = getDb();
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id required' });

    const rec = await generatePricingRecommendation(db, product_id);
    res.json(rec);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pricing/recommendations — all active recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const db = getDb();
    const recs = await recommendAllDiscounts(db);
    res.json({ recommendations: recs, count: recs.length, data_note: 'SIMULATED DEMO DATA' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pricing/approve — approve a recommendation
router.post('/approve/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare(`UPDATE pricing_recommendations SET status = 'approved', resolved_at = datetime('now') WHERE id = ?`).run(req.params.id);
    res.json({ success: true, message: 'Discount offer approved and activated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pricing/reject — reject a recommendation
router.post('/reject/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare(`UPDATE pricing_recommendations SET status = 'rejected', resolved_at = datetime('now') WHERE id = ?`).run(req.params.id);
    res.json({ success: true, message: 'Discount recommendation rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
