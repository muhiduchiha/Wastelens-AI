import { v4 as uuidv4 } from 'uuid';

export function seedDatabase(db) {
  seedProducts(db);
  seedInventory(db);
  seedSalesHistory(db);
  seedWasteRecords(db);
  seedMarketKnowledge(db);
}

function seedProducts(db) {
  const products = [
    { id: 'p001', name: 'Chicken Breast', category: 'Protein', sku: 'PRO-001', unit: 'kg', normal_price: 420, cost_price: 280, shelf_life_days: 3, supplier_lead_days: 1, reorder_point: 15, max_stock: 80 },
    { id: 'p002', name: 'Beef Mince', category: 'Protein', sku: 'PRO-002', unit: 'kg', normal_price: 680, cost_price: 480, shelf_life_days: 3, supplier_lead_days: 1, reorder_point: 10, max_stock: 50 },
    { id: 'p003', name: 'Hilsa Fish', category: 'Protein', sku: 'PRO-003', unit: 'kg', normal_price: 950, cost_price: 650, shelf_life_days: 2, supplier_lead_days: 1, reorder_point: 8, max_stock: 40 },
    { id: 'p004', name: 'Eggs (dozen)', category: 'Protein', sku: 'PRO-004', unit: 'dozen', normal_price: 160, cost_price: 110, shelf_life_days: 21, supplier_lead_days: 2, reorder_point: 20, max_stock: 200 },
    { id: 'p005', name: 'Chicken Sandwich (Ready)', category: 'Ready Food', sku: 'RDY-001', unit: 'pcs', normal_price: 280, cost_price: 160, shelf_life_days: 1, supplier_lead_days: 0, reorder_point: 5, max_stock: 60 },
    { id: 'p006', name: 'Fresh Milk', category: 'Dairy', sku: 'DAI-001', unit: 'L', normal_price: 90, cost_price: 60, shelf_life_days: 5, supplier_lead_days: 1, reorder_point: 20, max_stock: 150 },
    { id: 'p007', name: 'Yogurt', category: 'Dairy', sku: 'DAI-002', unit: 'kg', normal_price: 180, cost_price: 120, shelf_life_days: 7, supplier_lead_days: 2, reorder_point: 10, max_stock: 60 },
    { id: 'p008', name: 'Butter', category: 'Dairy', sku: 'DAI-003', unit: 'kg', normal_price: 850, cost_price: 600, shelf_life_days: 30, supplier_lead_days: 3, reorder_point: 5, max_stock: 30 },
    { id: 'p009', name: 'Tomato', category: 'Vegetable', sku: 'VEG-001', unit: 'kg', normal_price: 60, cost_price: 35, shelf_life_days: 5, supplier_lead_days: 1, reorder_point: 20, max_stock: 100 },
    { id: 'p010', name: 'Potato', category: 'Vegetable', sku: 'VEG-002', unit: 'kg', normal_price: 45, cost_price: 28, shelf_life_days: 14, supplier_lead_days: 2, reorder_point: 30, max_stock: 200 },
    { id: 'p011', name: 'Onion', category: 'Vegetable', sku: 'VEG-003', unit: 'kg', normal_price: 55, cost_price: 32, shelf_life_days: 21, supplier_lead_days: 2, reorder_point: 25, max_stock: 150 },
    { id: 'p012', name: 'Green Chili', category: 'Vegetable', sku: 'VEG-004', unit: 'kg', normal_price: 120, cost_price: 75, shelf_life_days: 7, supplier_lead_days: 1, reorder_point: 5, max_stock: 30 },
    { id: 'p013', name: 'Brinjal (Eggplant)', category: 'Vegetable', sku: 'VEG-005', unit: 'kg', normal_price: 50, cost_price: 30, shelf_life_days: 5, supplier_lead_days: 1, reorder_point: 15, max_stock: 80 },
    { id: 'p014', name: 'Spinach', category: 'Vegetable', sku: 'VEG-006', unit: 'kg', normal_price: 40, cost_price: 22, shelf_life_days: 3, supplier_lead_days: 1, reorder_point: 10, max_stock: 50 },
    { id: 'p015', name: 'Cucumber', category: 'Vegetable', sku: 'VEG-007', unit: 'kg', normal_price: 35, cost_price: 20, shelf_life_days: 7, supplier_lead_days: 1, reorder_point: 10, max_stock: 60 },
    { id: 'p016', name: 'Banana (Deshi)', category: 'Fruit', sku: 'FRT-001', unit: 'dozen', normal_price: 70, cost_price: 42, shelf_life_days: 5, supplier_lead_days: 1, reorder_point: 20, max_stock: 100 },
    { id: 'p017', name: 'Mango (Himsagar)', category: 'Fruit', sku: 'FRT-002', unit: 'kg', normal_price: 180, cost_price: 110, shelf_life_days: 4, supplier_lead_days: 1, reorder_point: 10, max_stock: 60 },
    { id: 'p018', name: 'Papaya', category: 'Fruit', sku: 'FRT-003', unit: 'kg', normal_price: 55, cost_price: 32, shelf_life_days: 5, supplier_lead_days: 1, reorder_point: 8, max_stock: 40 },
    { id: 'p019', name: 'Basmati Rice', category: 'Grain', sku: 'GRN-001', unit: 'kg', normal_price: 110, cost_price: 72, shelf_life_days: 365, supplier_lead_days: 3, reorder_point: 50, max_stock: 500 },
    { id: 'p020', name: 'Wheat Flour (Atta)', category: 'Grain', sku: 'GRN-002', unit: 'kg', normal_price: 65, cost_price: 42, shelf_life_days: 180, supplier_lead_days: 3, reorder_point: 30, max_stock: 300 },
    { id: 'p021', name: 'Lentils (Masoor Dal)', category: 'Grain', sku: 'GRN-003', unit: 'kg', normal_price: 130, cost_price: 85, shelf_life_days: 180, supplier_lead_days: 3, reorder_point: 20, max_stock: 200 },
    { id: 'p022', name: 'Beef Biriyani (Ready)', category: 'Ready Food', sku: 'RDY-002', unit: 'pcs', normal_price: 350, cost_price: 200, shelf_life_days: 1, supplier_lead_days: 0, reorder_point: 10, max_stock: 50 },
    { id: 'p023', name: 'Vegetable Samosa', category: 'Ready Food', sku: 'RDY-003', unit: 'pcs', normal_price: 25, cost_price: 12, shelf_life_days: 1, supplier_lead_days: 0, reorder_point: 20, max_stock: 200 },
    { id: 'p024', name: 'Mishti Doi (Sweet Yogurt)', category: 'Dairy', sku: 'DAI-004', unit: 'pcs', normal_price: 60, cost_price: 35, shelf_life_days: 3, supplier_lead_days: 1, reorder_point: 10, max_stock: 60 },
    { id: 'p025', name: 'White Bread', category: 'Bakery', sku: 'BAK-001', unit: 'loaf', normal_price: 55, cost_price: 32, shelf_life_days: 3, supplier_lead_days: 1, reorder_point: 15, max_stock: 100 },
  ];

  for (const p of products) {
    db.prepare(`INSERT OR IGNORE INTO products 
      (id, name, category, sku, unit, normal_price, cost_price, min_margin, shelf_life_days, supplier_lead_days, reorder_point, max_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run([p.id, p.name, p.category, p.sku, p.unit, p.normal_price, p.cost_price, 0.15, p.shelf_life_days, p.supplier_lead_days, p.reorder_point, p.max_stock]);
  }
  console.log(`  ↳ Inserted ${products.length} products`);
}

function seedInventory(db) {
  const now = new Date();

  const getExpiry = (days, offsetHours = 0) => {
    const d = new Date(now);
    d.setHours(d.getHours() + offsetHours);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const inventory = [
    { product_id: 'p005', quantity: 42, expiry_date: getExpiry(0, 9) },
    { product_id: 'p001', quantity: 28, expiry_date: getExpiry(1) },
    { product_id: 'p003', quantity: 18, expiry_date: getExpiry(1) },
    { product_id: 'p014', quantity: 22, expiry_date: getExpiry(1) },
    { product_id: 'p022', quantity: 35, expiry_date: getExpiry(0, 6) },
    { product_id: 'p002', quantity: 15, expiry_date: getExpiry(2) },
    { product_id: 'p006', quantity: 45, expiry_date: getExpiry(2) },
    { product_id: 'p009', quantity: 38, expiry_date: getExpiry(3) },
    { product_id: 'p016', quantity: 60, expiry_date: getExpiry(3) },
    { product_id: 'p017', quantity: 25, expiry_date: getExpiry(2) },
    { product_id: 'p018', quantity: 20, expiry_date: getExpiry(3) },
    { product_id: 'p025', quantity: 48, expiry_date: getExpiry(2) },
    { product_id: 'p023', quantity: 85, expiry_date: getExpiry(0, 8) },
    { product_id: 'p024', quantity: 32, expiry_date: getExpiry(1) },
    { product_id: 'p004', quantity: 120, expiry_date: getExpiry(18) },
    { product_id: 'p007', quantity: 25, expiry_date: getExpiry(5) },
    { product_id: 'p008', quantity: 12, expiry_date: getExpiry(25) },
    { product_id: 'p010', quantity: 95, expiry_date: getExpiry(12) },
    { product_id: 'p011', quantity: 80, expiry_date: getExpiry(18) },
    { product_id: 'p012', quantity: 18, expiry_date: getExpiry(5) },
    { product_id: 'p013', quantity: 42, expiry_date: getExpiry(4) },
    { product_id: 'p015', quantity: 35, expiry_date: getExpiry(6) },
    { product_id: 'p019', quantity: 180, expiry_date: getExpiry(300) },
    { product_id: 'p020', quantity: 95, expiry_date: getExpiry(150) },
    { product_id: 'p021', quantity: 68, expiry_date: getExpiry(150) },
  ];

  const now_iso = new Date().toISOString();
  for (const item of inventory) {
    db.prepare(`INSERT OR IGNORE INTO inventory (id, product_id, quantity, expiry_date, batch_id, received_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run([uuidv4(), item.product_id, item.quantity, item.expiry_date, `BATCH-${Date.now()}`, now_iso, now_iso]);
  }
  console.log(`  ↳ Inserted ${inventory.length} inventory records`);
}

function getProductById(db, id) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get([id]);
}

function seedSalesHistory(db) {
  const records = [];
  const now = new Date();

  const dailySales = {
    'p001': { avg: 12, stddev: 3 }, 'p002': { avg: 8, stddev: 2 },
    'p003': { avg: 6, stddev: 2 }, 'p004': { avg: 25, stddev: 5 },
    'p005': { avg: 18, stddev: 6 }, 'p006': { avg: 30, stddev: 8 },
    'p007': { avg: 12, stddev: 3 }, 'p008': { avg: 4, stddev: 1 },
    'p009': { avg: 20, stddev: 7 }, 'p010': { avg: 35, stddev: 10 },
    'p011': { avg: 28, stddev: 8 }, 'p012': { avg: 8, stddev: 3 },
    'p013': { avg: 15, stddev: 4 }, 'p014': { avg: 10, stddev: 4 },
    'p015': { avg: 12, stddev: 3 }, 'p016': { avg: 22, stddev: 6 },
    'p017': { avg: 10, stddev: 4 }, 'p018': { avg: 8, stddev: 2 },
    'p019': { avg: 40, stddev: 12 }, 'p020': { avg: 25, stddev: 7 },
    'p021': { avg: 18, stddev: 5 }, 'p022': { avg: 20, stddev: 6 },
    'p023': { avg: 60, stddev: 20 }, 'p024': { avg: 15, stddev: 4 },
    'p025': { avg: 20, stddev: 6 },
  };

  for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
    const saleDate = new Date(now);
    saleDate.setDate(saleDate.getDate() - dayOffset);
    const dayOfWeek = saleDate.getDay();
    const weekendMult = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.3 : 1.0;
    const dailyMult = 0.8 + Math.random() * 0.4;
    const saleDateStr = saleDate.toISOString().split('T')[0];

    for (const [productId, { avg, stddev }] of Object.entries(dailySales)) {
      const baseQty = avg * weekendMult * dailyMult;
      const qty = Math.max(0, Math.round(baseQty + (Math.random() - 0.5) * stddev * 2));
      if (qty === 0) continue;

      const product = getProductById(db, productId);
      if (!product) continue;

      records.push([uuidv4(), productId, qty, product.normal_price, qty * product.normal_price, 0, saleDateStr, dayOfWeek, 12, 'historical_seed']);
    }
  }

  for (const r of records) {
    db.prepare(`INSERT OR IGNORE INTO sales_history (id, product_id, quantity, unit_price, total_amount, discount_pct, sale_date, day_of_week, hour_of_day, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(r);
  }
  console.log(`  ↳ Inserted ${records.length} sales records`);
}

function seedWasteRecords(db) {
  const now = new Date();
  const wasteData = [
    { product_id: 'p005', qty: 8, reason: 'Expired - over-ordered' },
    { product_id: 'p001', qty: 5, reason: 'Expired - forecast miss' },
    { product_id: 'p014', qty: 6, reason: 'Wilted - delayed sales' },
    { product_id: 'p003', qty: 3, reason: 'Expired - over-ordered' },
    { product_id: 'p022', qty: 12, reason: 'Expired - over-prepared' },
    { product_id: 'p006', qty: 10, reason: 'Expired - delivery excess' },
    { product_id: 'p009', qty: 15, reason: 'Spoiled - storage issue' },
    { product_id: 'p016', qty: 18, reason: 'Overripe - slow sales' },
    { product_id: 'p025', qty: 20, reason: 'Expired - over-ordered' },
    { product_id: 'p017', qty: 8, reason: 'Overripe - seasonal dip' },
  ];

  let count = 0;
  for (let i = 0; i < 7; i++) {
    for (const w of wasteData) {
      const wasteDate = new Date(now);
      wasteDate.setDate(wasteDate.getDate() - (i + 1));
      const product = getProductById(db, w.product_id);
      if (!product) continue;
      const qty = Math.round(w.qty * (0.6 + Math.random() * 0.8));
      db.prepare(`INSERT OR IGNORE INTO waste_records (id, product_id, quantity, reason, waste_date, estimated_value, co2e_kg)
        VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run([uuidv4(), w.product_id, qty, w.reason, wasteDate.toISOString().split('T')[0], qty * product.cost_price, qty * 2.5]);
      count++;
    }
  }
  console.log(`  ↳ Inserted ${count} waste records`);
}

function seedMarketKnowledge(db) {
  const knowledge = [
    { category: 'seasonal_trend', title: 'Eid ul-Fitr Demand Surge', content: 'During Eid ul-Fitr (varies by Islamic calendar), demand for beef, chicken, and sweets increases by 150-200%. Restaurants see 3x normal footfall. Pre-Eid bulk purchasing recommended 7-10 days in advance. Hilsa fish demand spikes significantly.', source: 'bd_market_data' },
    { category: 'seasonal_trend', title: 'Ramadan Food Patterns', content: 'During Ramadan, daytime sales drop 60-70%. Iftar (6pm) demand spikes 300% for dates, fruits, samosa, and beverages. Sehri (3-4am) demand for milk, bread, and eggs increases. Daily food waste risk decreases in morning but risk of overnight spoilage increases.', source: 'bd_market_data' },
    { category: 'seasonal_trend', title: 'Mango Season (May-July)', content: 'Bangladesh mango season peaks May-July. Himsagar variety available May-June at ৳120-200/kg. During season, prices drop 40% and shelf life is critical (2-4 days). Over-ordering risk is high.', source: 'bd_market_data' },
    { category: 'seasonal_trend', title: 'Winter Vegetable Abundance (Nov-Feb)', content: 'November to February brings abundant winter vegetables: cauliflower, cabbage, peas, carrots. Prices drop 30-50%. Tomato prices fall from ৳80/kg to ৳30-40/kg. Spinach and leafy greens are very cheap but highly perishable. Adjust ordering accordingly.', source: 'bd_market_data' },
    { category: 'price_data', title: 'Dhaka Wholesale Prices - Proteins', content: 'Current wholesale prices in Dhaka: Chicken breast ৳260-310/kg (retail ৳380-450), Beef ৳450-520/kg (retail ৳620-720), Hilsa fish ৳600-800/kg (retail ৳900-1100, varies by size). Egg farm gate ৳9-10/piece, retail ৳12-14. Prices fluctuate 10-15% weekly.', source: 'karwan_bazar_data' },
    { category: 'price_data', title: 'Dhaka Wholesale Prices - Vegetables', content: 'Karwan Bazar wholesale: Tomato ৳25-45/kg (season-dependent), Potato ৳22-30/kg, Onion ৳30-50/kg (domestic), Green chili ৳60-100/kg, Brinjal ৳20-35/kg. Retail markup typically 30-50% over wholesale.', source: 'karwan_bazar_data' },
    { category: 'price_data', title: 'Dairy Prices Bangladesh', content: 'Fresh milk: BRAC Dairy/Aarong ৳75-85/L retail, local farm ৳55-65/L. Yogurt ৳150-200/kg. Butter ৳750-900/kg. Mishti Doi varies by size ৳40-80/unit. Dairy products have strict cold chain requirements in Bangladesh heat.', source: 'bd_dairy_market' },
    { category: 'supplier_info', title: 'Karwan Bazar Supplier Lead Times', content: 'Karwan Bazar Dhaka: Same-day pickup available 5am-9am. Next-day delivery for orders placed before 6pm. Minimum order: Vegetables ৳500, Protein ৳1000. Delivery within Dhaka 2-4 hours. Reliability: Vegetables 95%, Protein 90%, Fish 85% (weather-dependent).', source: 'supplier_database' },
    { category: 'supplier_info', title: 'Cold Chain Logistics Bangladesh', content: 'Refrigerated transport from Chittagong port to Dhaka: 6-8 hours. Local cold storage availability: Limited outside Dhaka. Fish supply from Chittagong/Cox Bazar takes 12-18 hours. During floods (Jul-Sep), supply chain disruptions increase lead times by 50-100%.', source: 'logistics_data' },
    { category: 'shelf_life', title: 'Tropical Climate Shelf Life Bangladesh', content: 'In Bangladesh tropical climate (25-35°C ambient), standard shelf life guidelines: Cooked rice/curry 4-6 hours unrefrigerated. Chicken/beef: 1-2 days refrigerated (3-5°C). Fish: 1-2 days max. Leafy greens: 1-2 days refrigerated. Without AC, reduce all shelf lives by 50%.', source: 'food_safety_bd' },
    { category: 'shelf_life', title: 'Ready Food Expiry Guidelines', content: 'Prepared foods in Bangladesh restaurants: Biriyani safe for 6-8 hours at room temperature. Sandwiches/wraps: 4-6 hours. Deep fried items (samosa, etc): 6-8 hours optimal, 12 hours max. Refrigerated: add 24 hours. Reheating required after 4 hours.', source: 'food_safety_bd' },
    { category: 'market_trend', title: 'Dhaka Food Delivery Demand Trends', content: 'Dhaka online food delivery grew 35% in 2024-2025. Peak hours: 12pm-2pm (lunch), 7pm-9pm (dinner). Friday-Saturday highest order volume. Health-conscious options growing 20% YoY. Biriyani, grilled chicken remain top sellers. Waste from delivery: 8-12% more than dine-in.', source: 'market_research_2025' },
    { category: 'market_trend', title: 'Inflation Impact on Food Costs BD', content: 'Bangladesh food inflation: 2024-2025 average 8-12%. Protein prices most volatile (+15-20%). Rice relatively stable (+5%). Import-dependent items (onion from India, some fruit) highly volatile. Dollar fluctuation affects imported food costs by 10-15%.', source: 'bd_economic_data' },
    { category: 'procurement_rule', title: 'Optimal Order Quantities - Restaurant', content: 'Best practice: Order perishables for 1.5-2 days coverage. Proteins: Order 80-90% of weekly forecast. Vegetables: 70-80% (can substitute). Dry goods: 2-week buffer. Emergency reorder triggers: Stock < 20% of weekly usage. Never order more than max storage capacity.', source: 'procurement_best_practice' },
    { category: 'procurement_rule', title: 'Bangladesh Halal Requirements', content: 'All meat products must be certified halal. Beef and chicken require halal certification documentation. Pork products prohibited. Supplier halal certificates must be renewed annually. BSTI certification recommended for packaged goods. Keep slaughter date records for traceability.', source: 'bd_food_regulation' },
    { category: 'events_holidays', title: 'Major Bangladesh Holidays 2026', content: 'Key dates affecting food demand 2026: Eid ul-Fitr (approx March 30), Eid ul-Adha (approx June 7), Pohela Boishakh/Bengali New Year (April 14 - huge street food demand), Victory Day (December 16), Independence Day (March 26). Plan 7 days ahead for all major holidays.', source: 'bd_calendar_2026' },
    { category: 'events_holidays', title: 'Weekly Peak Patterns Dhaka', content: 'Dhaka restaurants weekly pattern: Thursday evening (pre-weekend) +25% demand. Friday +40% (family outings). Saturday +30%. Sunday-Wednesday: normal. School exam periods reduce family dining by 15-20%. Cricket match days increase demand for quick food/delivery by 50%.', source: 'restaurant_analytics' },
    { category: 'logistics', title: 'Dhaka Traffic & Delivery Windows', content: 'Optimal delivery windows in Dhaka: 5am-8am (pre-rush), 11am-12pm (lunch gap), 3pm-5pm (afternoon). Avoid 8am-11am and 5pm-8pm (peak traffic). Mirpur, Uttara, Gulshan to Karwan Bazar: 45-90 minutes depending on time. Flood season (June-September) adds 30-60 min.', source: 'dhaka_logistics' },
  ];

  const now_iso = new Date().toISOString();
  for (const k of knowledge) {
    db.prepare(`INSERT OR IGNORE INTO market_knowledge (id, category, title, content, source, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run([uuidv4(), k.category, k.title, k.content, k.source, now_iso]);
  }
  console.log(`  ↳ Inserted ${knowledge.length} market knowledge entries`);
}
