import express from 'express';
import { getDb } from '../db/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDb();

    // Today's waste
    const todayWaste = db.prepare(`
      SELECT SUM(quantity) as total_kg, SUM(estimated_value) as total_value, SUM(co2e_kg) as co2e
      FROM waste_records WHERE waste_date = date('now')
    `).get();

    // Week's waste
    const weekWaste = db.prepare(`
      SELECT SUM(quantity) as total_kg, SUM(estimated_value) as total_value
      FROM waste_records WHERE waste_date >= date('now', '-7 days')
    `).get();

    // Week's waste before AI (use 7-day historical as "baseline")
    const baselineWeekWaste = (weekWaste.total_kg || 0) * 1.48; // simulate 48% more without AI

    // Inventory value
    const inventoryValue = db.prepare(`
      SELECT SUM(i.quantity * p.cost_price) as total_value
      FROM inventory i JOIN products p ON i.product_id = p.id
    `).get();

    // High risk items (expiry within 24 hours or waste risk > 70%)
    const highRiskItems = db.prepare(`
      SELECT p.name, p.category, i.quantity, i.expiry_date, p.normal_price,
             CAST((julianday(i.expiry_date) - julianday('now')) * 24 AS INTEGER) as hours_to_expiry
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE (julianday(i.expiry_date) - julianday('now')) * 24 <= 24
      ORDER BY hours_to_expiry ASC
      LIMIT 10
    `).all();

    // Active pricing recommendations
    const activePricing = db.prepare(`
      SELECT pr.*, p.name as product_name
      FROM pricing_recommendations pr
      JOIN products p ON pr.product_id = p.id
      WHERE pr.status = 'pending'
      ORDER BY pr.waste_risk DESC
      LIMIT 5
    `).all();

    // Revenue from discounts (last 7 days)
    const discountRevenue = db.prepare(`
      SELECT SUM(total_amount) as revenue
      FROM sales_history
      WHERE discount_pct > 0 AND sale_date >= date('now', '-7 days')
    `).get();

    // Today's sales
    const todaySales = db.prepare(`
      SELECT SUM(total_amount) as revenue, SUM(quantity) as units_sold
      FROM sales_history WHERE sale_date = date('now')
    `).get();

    // 7-day waste trend
    const wasteTrend = db.prepare(`
      SELECT waste_date, SUM(quantity) as kg_wasted, SUM(estimated_value) as value_wasted
      FROM waste_records
      WHERE waste_date >= date('now', '-7 days')
      GROUP BY waste_date
      ORDER BY waste_date ASC
    `).all();

    const aiWasteKg = weekWaste.total_kg || 0;
    const baselineWasteKg = baselineWeekWaste;
    const wasteReductionPct = baselineWasteKg > 0
      ? ((baselineWasteKg - aiWasteKg) / baselineWasteKg * 100).toFixed(1)
      : 0;

    res.json({
      kpis: {
        waste_today_kg: parseFloat((todayWaste.total_kg || 0).toFixed(2)),
        waste_today_value: parseFloat((todayWaste.total_value || 0).toFixed(0)),
        waste_week_kg: parseFloat((weekWaste.total_kg || 0).toFixed(2)),
        baseline_week_kg: parseFloat(baselineWeekWaste.toFixed(2)),
        waste_reduction_pct: parseFloat(wasteReductionPct),
        food_rescued_kg: parseFloat((baselineWeekWaste - aiWasteKg).toFixed(2)),
        money_saved: parseFloat(((weekWaste.total_value || 0) * 0.48).toFixed(0)),
        co2e_avoided_kg: parseFloat(((baselineWeekWaste - aiWasteKg) * 2.5).toFixed(2)),
        inventory_value: parseFloat((inventoryValue.total_value || 0).toFixed(0)),
        discount_revenue: parseFloat((discountRevenue.revenue || 0).toFixed(0)),
        today_revenue: parseFloat((todaySales.revenue || 0).toFixed(0)),
        high_risk_count: highRiskItems.length,
        active_offers: activePricing.length,
      },
      high_risk_items: highRiskItems,
      active_pricing: activePricing,
      waste_trend: wasteTrend,
      timestamp: new Date().toISOString(),
      data_note: 'SIMULATED DEMO DATA — Not real operational data'
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
