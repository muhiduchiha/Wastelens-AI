/**
 * WASTELENS AI Copilot Service
 */
import { getDb } from '../db/database.js';
import { runCopilotTurn } from './geminiService.js';
import { forecastAllProducts } from './forecastEngine.js';
import { calculateWasteRisk, calculateDaysRemaining } from './wasteEngine.js';

export async function runCopilot(message, previousInteractionId = null) {
  const db = getDb();

  // Build app context for copilot
  const context = buildAppContext(db);

  try {
    const result = await runCopilotTurn(message, context, previousInteractionId);
    return {
      response: result.text,
      interaction_id: result.interaction_id,
      powered_by: 'gemini-3.8-flash',
      data_note: 'Responses based on simulated demo data'
    };
  } catch (err) {
    console.error('[Copilot] Gemini error:', err.message);
    return {
      response: generateFallbackResponse(message, context),
      interaction_id: null,
      powered_by: 'fallback_deterministic',
      data_note: 'SIMULATED DEMO DATA — Gemini unavailable, using rule-based fallback'
    };
  }
}

function buildAppContext(db) {
  // High-risk inventory
  const highRisk = db.prepare(`
    SELECT i.*, p.name, p.category, p.shelf_life_days, p.normal_price, p.cost_price
    FROM inventory i JOIN products p ON i.product_id = p.id
    WHERE (julianday(i.expiry_date) - julianday('now')) <= 2
    ORDER BY i.expiry_date ASC LIMIT 10
  `).all().map(item => ({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    days_remaining: parseFloat(calculateDaysRemaining(item.expiry_date).toFixed(2)),
    normal_price: item.normal_price,
  }));

  // Recent waste
  const recentWaste = db.prepare(`
    SELECT p.name, SUM(w.quantity) as total_wasted
    FROM waste_records w JOIN products p ON w.product_id = p.id
    WHERE w.waste_date >= date('now', '-7 days')
    GROUP BY p.name ORDER BY total_wasted DESC LIMIT 5
  `).all();

  // Needs reorder
  const needsReorder = db.prepare(`
    SELECT p.name, i.quantity, p.reorder_point, p.unit
    FROM inventory i JOIN products p ON i.product_id = p.id
    WHERE i.quantity <= p.reorder_point LIMIT 5
  `).all();

  return {
    high_risk_items: highRisk,
    recent_waste_top5: recentWaste,
    needs_reorder: needsReorder,
    current_datetime: new Date().toISOString(),
    location: 'Dhaka, Bangladesh',
    currency: 'BDT (৳)'
  };
}

function generateFallbackResponse(message, context) {
  const msg = message.toLowerCase();

  if (msg.includes('buy') || msg.includes('purchase') || msg.includes('order')) {
    const reorder = context.needs_reorder;
    if (reorder.length === 0) return 'All inventory levels are currently adequate. No immediate purchasing is needed based on current stock and demand forecasts.';
    return `Based on current inventory, you should consider ordering:\n\n${reorder.map(r => `• **${r.name}**: Current stock ${r.quantity} ${r.unit} (reorder point: ${r.reorder_point} ${r.unit})`).join('\n')}\n\n*Note: Use the AI Agents panel for detailed procurement recommendations.*`;
  }

  if (msg.includes('waste') || msg.includes('risk') || msg.includes('expire') || msg.includes('spoil')) {
    const items = context.high_risk_items;
    if (items.length === 0) return 'No critical waste risks detected at this time. All inventory is within safe usage windows.';
    return `🚨 **High Waste Risk Items** (next 48 hours):\n\n${items.slice(0, 5).map(i => `• **${i.name}**: ${i.quantity} units, expires in ${(i.days_remaining * 24).toFixed(0)}h`).join('\n')}\n\n*Recommendation: Apply dynamic discounts to clear these items. See the Dynamic Pricing page.*`;
  }

  if (msg.includes('discount') || msg.includes('price') || msg.includes('offer')) {
    return 'The Dynamic Pricing Agent automatically calculates optimal discounts based on waste risk, demand forecast, and minimum margin requirements. Check the **Dynamic Pricing** page to see and approve current recommendations.\n\n*Discount formula: Higher waste risk + lower time remaining = steeper discount (up to 30% within margin limits).*';
  }

  if (msg.includes('first') || msg.includes('fifo') || msg.includes('use')) {
    const items = context.high_risk_items;
    if (items.length === 0) return 'All items are within normal inventory windows. Follow standard FIFO (First In, First Out) rotation.';
    return `**Use These Items First** (sorted by urgency):\n\n${items.map((i, idx) => `${idx + 1}. **${i.name}** — ${(i.days_remaining * 24).toFixed(0)}h remaining (${i.quantity} units)`).join('\n')}\n\n*WASTELENS recommends FIFO + risk-weighted prioritization.*`;
  }

  if (msg.includes('cause') || msg.includes('why') || msg.includes('reason')) {
    const waste = context.recent_waste_top5;
    if (waste.length === 0) return 'No significant waste recorded in the past 7 days.';
    return `**Top Waste Causes (Last 7 Days)**:\n\n${waste.map(w => `• **${w.name}**: ${w.total_wasted.toFixed(1)} units wasted`).join('\n')}\n\nCommon causes: Over-ordering without demand alignment, missed discount windows, inadequate FIFO rotation.\n\n*Use the Simulation Lab to see how AI optimization reduces these patterns.*`;
  }

  return `I'm WASTELENS AI Copilot. I can help you with:\n\n• 🛒 **What to buy** — procurement recommendations\n• ⚠️ **Waste risks** — which items may expire\n• 💰 **Discounts** — dynamic pricing logic\n• 📦 **Use first** — FIFO prioritization\n• 📊 **Waste causes** — root cause analysis\n\nAsk me anything about your food inventory!\n\n*Note: Connecting to Gemini API will enable more intelligent responses.*`;
}
