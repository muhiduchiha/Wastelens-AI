import { getDb, initDb } from './src/db/database.js';
await initDb();
const db = getDb();

// Check expiry dates
const rows = db.prepare(`
  SELECT p.name, i.quantity, i.expiry_date,
    CAST((julianday(i.expiry_date) - julianday('now')) * 24 AS INTEGER) as hours_to_expiry
  FROM inventory i JOIN products p ON i.product_id = p.id
  ORDER BY i.expiry_date ASC
  LIMIT 10
`).all();
console.log('Expiry check:', JSON.stringify(rows, null, 2));

// Check pricing recs  
const pricing = db.prepare(`SELECT p.name, pr.discount_pct, pr.waste_risk, pr.status FROM pricing_recommendations pr JOIN products p ON pr.product_id = p.id LIMIT 5`).all();
console.log('Pricing recs:', JSON.stringify(pricing, null, 2));
