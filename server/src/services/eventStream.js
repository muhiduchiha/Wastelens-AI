/**
 * WASTELENS Event Stream
 * Simulated real-time events via Server-Sent Events (SSE)
 */
import { getDb } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

const clients = [];

export function getEventClients() {
  return clients;
}

export function addEventClient(res) {
  clients.push(res);
  return clients.length;
}

export function broadcastEvent(eventData) {
  const payload = JSON.stringify({
    ...eventData,
    id: uuidv4(),
    timestamp: new Date().toISOString()
  });

  const deadClients = [];
  clients.forEach((client, idx) => {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (e) {
      deadClients.push(idx);
    }
  });

  // Cleanup dead connections
  deadClients.reverse().forEach(idx => clients.splice(idx, 1));
}

// Simulated real-time event types
const EVENT_TYPES = [
  {
    type: 'pos_sale',
    generator: () => {
      const products = [
        { name: 'Chicken Sandwich', id: 'p005', price: 280 },
        { name: 'Beef Biriyani', id: 'p022', price: 350 },
        { name: 'Vegetable Samosa', id: 'p023', price: 25 },
        { name: 'Fresh Milk', id: 'p006', price: 90 },
        { name: 'Chicken Breast', id: 'p001', price: 420 },
        { name: 'Banana', id: 'p016', price: 70 },
      ];
      const p = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      return {
        type: 'pos_sale',
        label: '🛒 POS Sale',
        product_id: p.id,
        product_name: p.name,
        quantity: qty,
        unit_price: p.price,
        total: qty * p.price,
        message: `Sold ${qty}x ${p.name} — ৳${qty * p.price}`,
        severity: 'info'
      };
    }
  },
  {
    type: 'inventory_update',
    generator: () => {
      const changes = [
        { name: 'Chicken Breast', delta: -2, unit: 'kg' },
        { name: 'Spinach', delta: -1.5, unit: 'kg' },
        { name: 'Beef Mince', delta: -1, unit: 'kg' },
      ];
      const c = changes[Math.floor(Math.random() * changes.length)];
      return {
        type: 'inventory_update',
        label: '📦 Inventory Update',
        product_name: c.name,
        delta: c.delta,
        message: `${c.name} stock ${c.delta > 0 ? '+' : ''}${c.delta}${c.unit}`,
        severity: 'info'
      };
    }
  },
  {
    type: 'expiry_alert',
    generator: () => {
      const alerts = [
        { name: 'Chicken Sandwich', hours: 9 },
        { name: 'Beef Biriyani', hours: 6 },
        { name: 'Spinach', hours: 18 },
        { name: 'Vegetable Samosa', hours: 8 },
      ];
      const a = alerts[Math.floor(Math.random() * alerts.length)];
      return {
        type: 'expiry_alert',
        label: '⏰ Expiry Alert',
        product_name: a.name,
        hours_remaining: a.hours,
        message: `⚠️ ${a.name} expires in ${a.hours}h — discount recommended`,
        severity: 'warning'
      };
    }
  },
  {
    type: 'market_update',
    generator: () => {
      const updates = [
        { item: 'Chicken', change: '+5%', reason: 'Supply shortage' },
        { item: 'Tomato', change: '-12%', reason: 'Winter harvest peak' },
        { item: 'Fish', change: '+8%', reason: 'Rainy season impact' },
      ];
      const u = updates[Math.floor(Math.random() * updates.length)];
      return {
        type: 'market_update',
        label: '📈 Market Update',
        product_name: u.item,
        price_change: u.change,
        reason: u.reason,
        message: `Market: ${u.item} price ${u.change} (${u.reason})`,
        severity: 'info'
      };
    }
  },
  {
    type: 'ai_recommendation',
    generator: () => {
      const recs = [
        { action: 'DISCOUNT', product: 'Chicken Sandwich', detail: '25% discount applied' },
        { action: 'REORDER', product: 'Fresh Milk', detail: 'Order 20L from supplier' },
        { action: 'WASTE_ALERT', product: 'Spinach', detail: 'Use immediately — 85% waste risk' },
      ];
      const r = recs[Math.floor(Math.random() * recs.length)];
      return {
        type: 'ai_recommendation',
        label: '🤖 AI Action',
        action: r.action,
        product_name: r.product,
        detail: r.detail,
        message: `AI: ${r.action} → ${r.product} — ${r.detail}`,
        severity: r.action === 'WASTE_ALERT' ? 'danger' : 'success'
      };
    }
  }
];

export function startEventStream() {
  // Send events every 4-8 seconds
  const sendRandomEvent = () => {
    if (clients.length === 0) return;

    const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const event = eventType.generator();
    broadcastEvent(event);

    // Log to DB
    try {
      const db = getDb();
      db.prepare('INSERT INTO events (id, event_type, payload, created_at) VALUES (?, ?, ?, datetime("now"))')
        .run(uuidv4(), event.type, JSON.stringify(event));
    } catch (e) {}
  };

  setInterval(sendRandomEvent, 5000 + Math.random() * 3000);

  // Also send a heartbeat every 30s
  setInterval(() => {
    broadcastEvent({ type: 'heartbeat', message: 'WASTELENS AI — System Active', data_note: 'Demo / Simulated Real-Time Data' });
  }, 30000);

  console.log('📡 Real-time event stream initialized');
}
