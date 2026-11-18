/**
 * WASTELENS Forecast Engine
 * Uses weighted moving average with day-of-week seasonality
 * Pure deterministic algorithm — no AI for calculations
 */

/**
 * Forecast demand for a product over N days
 */
export function forecastDemand(db, productId, days = 7) {
  const history = db.prepare(`
    SELECT quantity, sale_date, day_of_week
    FROM sales_history
    WHERE product_id = ?
    ORDER BY sale_date DESC
    LIMIT 60
  `).all(productId);

  if (history.length === 0) {
    // No history — use reorder point as proxy
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    const dailyEst = product ? product.reorder_point / 7 : 2;
    return {
      daily: Array(days).fill(0).map((_, i) => ({
        day: i + 1,
        forecast: parseFloat(dailyEst.toFixed(2)),
        date: getFutureDate(i + 1)
      })),
      total: parseFloat((dailyEst * days).toFixed(2)),
      confidence: 0.3,
      method: 'default_estimate'
    };
  }

  // Calculate day-of-week averages
  const dowSales = {};
  for (let d = 0; d < 7; d++) dowSales[d] = { total: 0, count: 0 };

  history.forEach(h => {
    const dow = h.day_of_week ?? new Date(h.sale_date).getDay();
    dowSales[dow].total += h.quantity;
    dowSales[dow].count += 1;
  });

  const dowAvg = {};
  for (let d = 0; d < 7; d++) {
    dowAvg[d] = dowSales[d].count > 0 ? dowSales[d].total / dowSales[d].count : 0;
  }

  // Overall daily average (weighted: recent 14 days × 2, older × 1)
  const recent = history.slice(0, 14);
  const older = history.slice(14);
  const recentAvg = recent.length > 0 ? recent.reduce((s, h) => s + h.quantity, 0) / recent.length : 0;
  const olderAvg = older.length > 0 ? older.reduce((s, h) => s + h.quantity, 0) / older.length : recentAvg;
  const weightedAvg = (recentAvg * 2 + olderAvg) / 3;

  // Calculate day-of-week seasonality factors
  const totalDowAvg = Object.values(dowAvg).reduce((s, v) => s + v, 0) / 7;
  const seasonality = {};
  for (let d = 0; d < 7; d++) {
    seasonality[d] = totalDowAvg > 0 ? dowAvg[d] / totalDowAvg : 1;
  }

  // Build daily forecasts
  const today = new Date();
  const dailyForecasts = [];
  let total = 0;

  for (let i = 0; i < days; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + i + 1);
    const dow = futureDate.getDay();
    const forecast = Math.max(0, weightedAvg * (seasonality[dow] || 1));
    const rounded = parseFloat(forecast.toFixed(2));
    dailyForecasts.push({
      day: i + 1,
      date: futureDate.toISOString().split('T')[0],
      day_name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow],
      forecast: rounded,
      seasonality_factor: parseFloat((seasonality[dow] || 1).toFixed(2))
    });
    total += rounded;
  }

  const confidence = Math.min(0.95, 0.5 + (history.length / 60) * 0.45);

  return {
    daily: dailyForecasts,
    total: parseFloat(total.toFixed(2)),
    daily_average: parseFloat((total / days).toFixed(2)),
    confidence: parseFloat(confidence.toFixed(2)),
    history_days: history.length,
    method: 'weighted_moving_average_with_dow_seasonality'
  };
}

/**
 * Forecast all products (for dashboard)
 */
export function forecastAllProducts(db, days = 7) {
  const products = db.prepare('SELECT id, name, category FROM products').all();
  return products.map(p => ({
    product_id: p.id,
    product_name: p.name,
    category: p.category,
    ...forecastDemand(db, p.id, days)
  }));
}

function getFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}
