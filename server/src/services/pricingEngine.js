/**
 * WASTELENS Dynamic Pricing Engine
 * Deterministic discount calculation — Gemini used only for explanation
 */
import { getDb } from '../db/database.js';
import { forecastDemand } from './forecastEngine.js';
import { calculateWasteRisk, calculateDaysRemaining } from './wasteEngine.js';
import { getGeminiExplanation } from './geminiService.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Calculate discount percentage based on risk factors
 * Returns: { discount_pct, reason_code, factors }
 */
export function calculateDiscount(wasteRisk, daysRemaining, surplusPct, minMarginPct, costPrice, normalPrice) {
  const minPriceForMargin = costPrice * (1 + minMarginPct);
  const maxDiscount = Math.max(0, ((normalPrice - minPriceForMargin) / normalPrice) * 100);

  let discount = 0;
  let reasonCode = 'no_action';

  if (wasteRisk < 0.3) {
    // Low risk — no discount needed
    discount = 0;
    reasonCode = 'low_risk';
  } else if (wasteRisk < 0.5) {
    // Medium-low risk
    discount = Math.min(maxDiscount, 5 + (wasteRisk - 0.3) * 25);
    reasonCode = 'moderate_risk';
  } else if (wasteRisk < 0.7) {
    // Medium risk
    discount = Math.min(maxDiscount, 10 + (wasteRisk - 0.5) * 25);
    reasonCode = 'elevated_risk';
  } else if (wasteRisk < 0.85) {
    // High risk
    discount = Math.min(maxDiscount, 20 + (wasteRisk - 0.7) * 20);
    reasonCode = 'high_risk';
  } else {
    // Critical risk — maximum discount within margin
    discount = Math.min(maxDiscount, 30 + (wasteRisk - 0.85) * 10);
    reasonCode = 'critical_risk';
  }

  // Additional urgency boost if expiring today
  if (daysRemaining <= 0.5) discount = Math.min(maxDiscount, discount * 1.2);

  // Surplus amplification
  if (surplusPct > 0.5) discount = Math.min(maxDiscount, discount * 1.15);

  return {
    discount_pct: Math.round(discount),
    reason_code: reasonCode,
    max_possible_discount: Math.round(maxDiscount),
    factors: {
      waste_risk: wasteRisk,
      days_remaining: daysRemaining,
      surplus_pct: surplusPct,
      min_margin_pct: minMarginPct,
    }
  };
}

/**
 * Generate full pricing recommendation for a product
 */
export async function generatePricingRecommendation(db, productId) {
  const product = db.prepare(`
    SELECT p.*, i.quantity, i.expiry_date
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    WHERE p.id = ?
  `).get(productId);

  if (!product) throw new Error(`Product ${productId} not found`);

  const daysRemaining = calculateDaysRemaining(product.expiry_date);
  const forecast = forecastDemand(db, productId, Math.max(1, Math.ceil(daysRemaining)));
  const wasteRisk = calculateWasteRisk(product.quantity || 0, forecast.total, daysRemaining, product.shelf_life_days);

  const surplus = Math.max(0, (product.quantity || 0) - forecast.total);
  const surplusPct = product.quantity > 0 ? surplus / product.quantity : 0;

  const discountCalc = calculateDiscount(
    wasteRisk,
    daysRemaining,
    surplusPct,
    product.min_margin,
    product.cost_price,
    product.normal_price
  );

  const recommendedPrice = product.normal_price * (1 - discountCalc.discount_pct / 100);
  const expiresAt = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000 * 0.5).toISOString();

  // Get AI explanation (non-critical — has fallback)
  let explanation = getDefaultExplanation(discountCalc.reason_code, product.name, daysRemaining, wasteRisk);
  try {
    const aiExpl = await getGeminiExplanation({
      type: 'pricing',
      product: product.name,
      quantity: product.quantity,
      demand: forecast.total,
      daysRemaining,
      wasteRisk,
      discount: discountCalc.discount_pct,
      originalPrice: product.normal_price,
      newPrice: recommendedPrice
    });
    if (aiExpl) explanation = aiExpl;
  } catch (e) {
    // Use fallback explanation
  }

  // Save recommendation to DB
  if (discountCalc.discount_pct > 0) {
    const rec = {
      id: uuidv4(),
      product_id: productId,
      original_price: product.normal_price,
      recommended_price: parseFloat(recommendedPrice.toFixed(0)),
      discount_pct: discountCalc.discount_pct,
      waste_risk: wasteRisk,
      reason: explanation,
      expires_at: expiresAt,
      status: 'pending'
    };
    db.prepare(`
      INSERT OR REPLACE INTO pricing_recommendations (id, product_id, original_price, recommended_price, discount_pct, waste_risk, reason, expires_at, status)
      VALUES (@id, @product_id, @original_price, @recommended_price, @discount_pct, @waste_risk, @reason, @expires_at, @status)
    `).run(rec);
  }

  return {
    product_id: productId,
    product_name: product.name,
    category: product.category,
    quantity: product.quantity || 0,
    expiry_date: product.expiry_date,
    days_remaining: parseFloat(daysRemaining.toFixed(2)),
    demand_forecast: forecast.total,
    surplus,
    waste_risk: parseFloat(wasteRisk.toFixed(3)),
    original_price: product.normal_price,
    recommended_price: parseFloat(recommendedPrice.toFixed(0)),
    discount_pct: discountCalc.discount_pct,
    discount_factors: discountCalc.factors,
    reason_code: discountCalc.reason_code,
    explanation,
    expires_at: expiresAt,
    action_required: discountCalc.discount_pct >= 10,
    data_note: 'SIMULATED DEMO DATA — Algorithmic pricing with AI explanation'
  };
}

/**
 * Generate recommendations for all at-risk inventory
 */
export async function recommendAllDiscounts(db) {
  const atRiskItems = db.prepare(`
    SELECT i.product_id FROM inventory i
    WHERE (julianday(i.expiry_date) - julianday('now')) <= 3
  `).all();

  const recommendations = [];
  for (const item of atRiskItems) {
    try {
      const rec = await generatePricingRecommendation(db, item.product_id);
      if (rec.discount_pct > 0) recommendations.push(rec);
    } catch (e) {
      // Skip failed items
    }
  }

  return recommendations.sort((a, b) => b.waste_risk - a.waste_risk);
}

function getDefaultExplanation(reasonCode, productName, daysRemaining, wasteRisk) {
  const hours = Math.round(daysRemaining * 24);
  const riskPct = Math.round(wasteRisk * 100);

  const explanations = {
    critical_risk: `${productName} has a ${riskPct}% waste risk with only ${hours} hours remaining. Maximum discount applied to maximize sell-through before expiry.`,
    high_risk: `${productName} inventory significantly exceeds expected demand with ${hours}h remaining. Discount recommended to accelerate sales and prevent waste.`,
    elevated_risk: `${productName} shows elevated waste risk (${riskPct}%). Moderate discount will help clear surplus before expiry.`,
    moderate_risk: `${productName} has moderate surplus relative to forecasted demand. Small discount may help move inventory efficiently.`,
    low_risk: `${productName} inventory levels align well with demand forecast. No discount action needed.`,
    no_action: `No pricing action required for ${productName} at this time.`
  };

  return explanations[reasonCode] || explanations.no_action;
}
