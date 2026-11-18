import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { seedDatabase } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../dev.db');

let rawDb;
let wrappedDb;

export function getDb() {
  if (!wrappedDb) throw new Error('Database not initialized');
  return wrappedDb;
}

// Persist DB to disk
function persistDb() {
  try {
    if (!rawDb) return;
    const data = rawDb.export();
    writeFileSync(DB_PATH, Buffer.from(data));
  } catch (e) {
    console.error('[DB] Persist error:', e.message);
  }
}

// Auto-persist interval
let persistInterval;

export async function initDb() {
  const SQL = await initSqlJs();

  if (existsSync(DB_PATH)) {
    try {
      const fileBuffer = readFileSync(DB_PATH);
      rawDb = new SQL.Database(fileBuffer);
      console.log('✅ Database loaded from disk');
    } catch (e) {
      console.log('⚠️ Corrupt or invalid db file, creating new database');
      rawDb = new SQL.Database();
    }
  } else {
    rawDb = new SQL.Database();
    console.log('📦 New database created');
  }

  createTables(rawDb);

  wrappedDb = wrapDb(rawDb);

  // Check if already seeded
  const countRow = wrappedDb.prepare("SELECT COUNT(*) as c FROM products").get();
  const count = countRow?.c ?? 0;

  if (count === 0) {
    console.log('📦 Seeding database with demo data...');
    seedDatabase(wrappedDb);
    persistDb();
    console.log('✅ Database seeded successfully');
  } else {
    console.log(`✅ Database ready (${count} products loaded)`);
  }

  persistInterval = setInterval(persistDb, 10000);

  return wrappedDb;
}

function sanitizeParam(v) {
  if (v === undefined) return null;
  return v;
}

function wrapDb(sqlDb) {
  const prepare = (sql) => {
    return {
      get: (...params) => {
        const flatParams = params.flat().map(sanitizeParam);
        let res;
        try {
          res = sqlDb.exec(sql, flatParams);
        } catch (e) {
          // If named parameters like @param, replace them with ?
          if (sql.includes('@')) {
            const matches = sql.match(/@\w+/g) || [];
            const posParams = matches.map(m => {
              const key = m.slice(1);
              return sanitizeParam(flatParams[0]?.[key]);
            });
            const cleanSql = sql.replace(/@\w+/g, '?');
            res = sqlDb.exec(cleanSql, posParams);
          } else {
            throw e;
          }
        }
        if (!res || !res.length || !res[0].values.length) return undefined;
        const { columns, values } = res[0];
        return Object.fromEntries(columns.map((c, i) => [c, values[0][i]]));
      },

      all: (...params) => {
        const flatParams = params.flat().map(sanitizeParam);
        let res;
        try {
          res = sqlDb.exec(sql, flatParams);
        } catch (e) {
          if (sql.includes('@')) {
            const matches = sql.match(/@\w+/g) || [];
            const posParams = matches.map(m => {
              const key = m.slice(1);
              return sanitizeParam(flatParams[0]?.[key]);
            });
            const cleanSql = sql.replace(/@\w+/g, '?');
            res = sqlDb.exec(cleanSql, posParams);
          } else {
            throw e;
          }
        }
        if (!res || !res.length) return [];
        const { columns, values } = res[0];
        return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
      },

      run: (obj) => {
        let finalSql = sql;
        let positionalParams = [];

        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          const paramMatches = sql.match(/@\w+/g) || [];
          positionalParams = paramMatches.map(m => {
            const key = m.slice(1);
            return sanitizeParam(obj[key]);
          });
          finalSql = sql.replace(/@\w+/g, '?');
        } else if (Array.isArray(obj)) {
          positionalParams = obj.map(sanitizeParam);
        } else if (obj !== undefined && obj !== null) {
          positionalParams = [obj];
        }

        sqlDb.run(finalSql, positionalParams);
        persistDb();
        return { changes: sqlDb.getRowsModified() };
      }
    };
  };

  const exec = (sql) => {
    sqlDb.exec(sql);
    persistDb();
  };

  const transaction = (fn) => {
    return (items) => {
      sqlDb.run('BEGIN');
      try {
        fn(items);
        sqlDb.run('COMMIT');
        persistDb();
      } catch (e) {
        sqlDb.run('ROLLBACK');
        throw e;
      }
    };
  };

  return { prepare, exec, transaction, _raw: sqlDb };
}

function createTables(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      sku TEXT UNIQUE,
      unit TEXT DEFAULT 'kg',
      normal_price REAL NOT NULL,
      cost_price REAL NOT NULL,
      min_margin REAL DEFAULT 0.15,
      shelf_life_days INTEGER DEFAULT 7,
      supplier_id TEXT,
      supplier_lead_days INTEGER DEFAULT 2,
      reorder_point REAL DEFAULT 10,
      max_stock REAL DEFAULT 100,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity REAL NOT NULL DEFAULT 0,
      expiry_date TEXT,
      batch_id TEXT,
      location TEXT DEFAULT 'main',
      received_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sales_history (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      total_amount REAL NOT NULL,
      discount_pct REAL DEFAULT 0,
      sale_date TEXT NOT NULL,
      day_of_week INTEGER,
      hour_of_day INTEGER,
      notes TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS waste_records (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity REAL NOT NULL,
      reason TEXT,
      waste_date TEXT NOT NULL,
      estimated_value REAL,
      co2e_kg REAL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pricing_recommendations (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      original_price REAL NOT NULL,
      recommended_price REAL NOT NULL,
      discount_pct REAL NOT NULL,
      waste_risk REAL NOT NULL,
      reason TEXT,
      expires_at TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      resolved_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS agent_decisions (
      id TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      decision_type TEXT NOT NULL,
      input_data TEXT,
      output_data TEXT,
      reasoning TEXT,
      confidence REAL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS market_knowledge (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding_hint TEXT,
      valid_from TEXT,
      valid_to TEXT,
      source TEXT DEFAULT 'demo_seed',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      payload TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS simulation_runs (
      id TEXT PRIMARY KEY,
      baseline_waste_kg REAL,
      ai_waste_kg REAL,
      baseline_revenue REAL,
      ai_revenue REAL,
      food_rescued_kg REAL,
      co2e_avoided REAL,
      waste_reduction_pct REAL,
      run_config TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}
