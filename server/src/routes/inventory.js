import express from 'express';
import { getDb } from '../db/database.js';
import { calculateWasteRisk, calculateDaysRemaining } from '../services/wasteEngine.js';
import { forecastDemand } from '../services/forecastEngine.js';

const router = express.Router();

// GET /api/inventory — full inventory with risk scores
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT i.*, p.name, p.category, p.unit, p.normal_price, p.cost_price,
             p.shelf_life_days, p.reorder_point, p.max_stock, p.supplier_lead_days
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      ORDER BY i.expiry_date ASC NULLS LAST
    `).all();

    const enriched = rows.map(row => {
      const daysRemaining = calculateDaysRemaining(row.expiry_date);
      const forecast = forecastDemand(db, row.product_id, 3);
      const wasteRisk = calculateWasteRisk(row.quantity, forecast.total, daysRemaining, row.shelf_life_days);

      return {
        ...row,
        days_remaining: daysRemaining,
        hours_remaining: Math.max(0, daysRemaining * 24),
        demand_forecast_3d: forecast.total,
        daily_forecast: forecast.daily,
        waste_risk: wasteRisk,
        risk_level: wasteRisk > 0.7 ? 'HIGH' : wasteRisk > 0.4 ? 'MEDIUM' : 'LOW',
        surplus: Math.max(0, row.quantity - forecast.total),
        inventory_value: row.quantity * row.cost_price,
        needs_reorder: row.quantity <= row.reorder_point,
      };
    });

    res.json({
      inventory: enriched,
      summary: {
        total_items: enriched.length,
        high_risk: enriched.filter(i => i.risk_level === 'HIGH').length,
        medium_risk: enriched.filter(i => i.risk_level === 'MEDIUM').length,
        low_risk: enriched.filter(i => i.risk_level === 'LOW').length,
        needs_reorder: enriched.filter(i => i.needs_reorder).length,
        total_value: enriched.reduce((s, i) => s + i.inventory_value, 0),
      },
      data_note: 'SIMULATED DEMO DATA'
    });
  } catch (err) {
    console.error('Inventory error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/risk — only high-risk items
router.get('/risk', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT i.*, p.name, p.category, p.unit, p.normal_price, p.cost_price, p.shelf_life_days
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE (julianday(i.expiry_date) - julianday('now')) <= 2
      ORDER BY i.expiry_date ASC
    `).all();

    const enriched = rows.map(row => {
      const daysRemaining = calculateDaysRemaining(row.expiry_date);
      const forecast = forecastDemand(db, row.product_id, Math.ceil(daysRemaining));
      const wasteRisk = calculateWasteRisk(row.quantity, forecast.total, daysRemaining, row.shelf_life_days);
      return { ...row, days_remaining: daysRemaining, demand_forecast: forecast.total, waste_risk: wasteRisk };
    });

    res.json({ high_risk_items: enriched, count: enriched.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
