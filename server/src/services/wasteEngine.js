/**
 * WASTELENS Waste Risk Engine
 * Deterministic waste risk calculations — no AI
 */

/**
 * Calculate days remaining until expiry
 */
export function calculateDaysRemaining(expiryDate) {
  if (!expiryDate) return 999;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffMs = expiry - now;
  return Math.max(0, diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate waste risk score (0-1)
 * Factors: surplus quantity, days remaining, shelf life
 */
export function calculateWasteRisk(quantity, forecastDemand, daysRemaining, shelfLifeDays) {
  if (quantity <= 0) return 0;
  if (daysRemaining <= 0) return 1.0;

  // Surplus factor: how much more stock than demand
  const surplus = Math.max(0, quantity - forecastDemand);
  const surplusFactor = surplus / (quantity + 1); // 0 to 1

  // Time pressure factor: how close to expiry relative to shelf life
  const timePressure = Math.max(0, 1 - (daysRemaining / Math.max(1, shelfLifeDays)));

  // Combined risk (weighted)
  // High surplus + near expiry = very high risk
  const rawRisk = (surplusFactor * 0.5) + (timePressure * 0.5);

  // Apply urgency multiplier for items expiring very soon
  let urgencyMultiplier = 1.0;
  if (daysRemaining <= 0.5) urgencyMultiplier = 1.4;      // < 12 hours
  else if (daysRemaining <= 1) urgencyMultiplier = 1.25;   // < 1 day
  else if (daysRemaining <= 2) urgencyMultiplier = 1.1;    // < 2 days

  return Math.min(1.0, rawRisk * urgencyMultiplier);
}

/**
 * Calculate spoilage value (potential loss)
 */
export function calculateSpoilageValue(quantity, forecastDemand, costPrice) {
  const expectedWaste = Math.max(0, quantity - forecastDemand);
  return expectedWaste * costPrice;
}

/**
 * Estimate CO2e from food waste (avg ~2.5 kg CO2e per kg food waste)
 */
export function estimateCO2e(wasteKg) {
  return wasteKg * 2.5;
}

/**
 * Get waste summary for dashboard
 */
export function getWasteSummary(db) {
  const today = db.prepare(`
    SELECT SUM(quantity) as kg, SUM(estimated_value) as value, SUM(co2e_kg) as co2e
    FROM waste_records WHERE waste_date = date('now')
  `).get();

  const week = db.prepare(`
    SELECT SUM(quantity) as kg, SUM(estimated_value) as value
    FROM waste_records WHERE waste_date >= date('now', '-7 days')
  `).get();

  return {
    today: { kg: today.kg || 0, value: today.value || 0, co2e: today.co2e || 0 },
    week: { kg: week.kg || 0, value: week.value || 0 }
  };
}
