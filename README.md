# 🌿 WASTELENS AI
### Autonomous Food Waste & Inventory Intelligence

> **Built for the Food Waste Zero Hackathon Challenge**
> *Reduce simulated food waste by 30%+ through demand-aligned ordering and automated dynamic discounting.*

[![Demo Result](https://img.shields.io/badge/Waste%20Reduction-89.7%25-brightgreen)](http://localhost:5173)
[![Pages](https://img.shields.io/badge/Pages-9-blue)](http://localhost:5173)
[![APIs](https://img.shields.io/badge/APIs-16%2F16%20Passing-brightgreen)](http://localhost:3001/health)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Express%20%2B%20Gemini-orange)](https://ai.google.dev)

---

## 🎯 Real-World Problem Solved

Restaurants in Bangladesh (and globally) lose thousands of taka daily due to food waste caused by:

| Root Cause | Impact |
|-----------|--------|
| Guesswork-based purchasing | Overstocked perishables expire unsold |
| No dynamic pricing system | At-risk items are discounted too late or not at all |
| Manual inventory tracking | No real-time visibility into expiry timelines |
| No demand forecasting | Orders don't align with actual sales patterns |
| Reactive (not predictive) decisions | Waste is noticed after it happens, not before |

**WASTELENS AI** addresses all five with a multi-agent AI pipeline that continuously monitors inventory, forecasts demand, detects waste risk, and autonomously recommends dynamic discounts and procurement changes — keeping waste minimal while protecting revenue.

> **Simulated Proof:** Baseline waste of 1,427 kg reduced to 147 kg over 30 days = **89.7% waste reduction**.  
> *This is a simulated benchmark result. Real-world results will vary.*

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  REAL-TIME DATA SOURCES                 │
│  POS Sales │ Inventory │ Shelf Images │ Market Prices   │
└──────────────────────┬──────────────────────────────────┘
                       │  SSE / REST
┌──────────────────────▼──────────────────────────────────┐
│               DATA INGESTION LAYER                      │
│         Express API │ sql.js DB │ Event Stream          │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  AI AGENT PIPELINE                      │
│                                                         │
│  📊 Demand Agent      →  7-day demand forecast          │
│  📦 Inventory Agent   →  Stock risk analysis            │
│  🗑  Waste Agent       →  Spoilage probability score     │
│  🌐 Market Agent      →  RAG: local BD market context   │
│  💰 Pricing Agent     →  Algorithmic discount engine    │
│  🛒 Procurement Agent →  Buy / Do-Not-Buy decisions     │
│                              │                          │
│  🤖 Orchestrator Agent ◄─────┘  Final unified decision  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   DECISION ENGINE                       │
│  Purchase Orders │ Inventory Actions │ Flash Discounts  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   IMPACT ENGINE                         │
│  30%+ Waste Reduction │ Revenue Protection │ CO₂ Saved  │
└─────────────────────────────────────────────────────────┘
```

**Mermaid diagram** is also available interactively on the Architecture page of the app.

---

## 📄 Pages & Features

### 1. 🏠 Dashboard — AI Control Center
**Route:** `/`

The command center giving a full picture of waste prevention performance at a glance.

**Contents:**
- 8 live KPI cards: Waste Today, Waste Reduction %, Food Rescued (kg), CO₂e Avoided, Money Saved, Inventory Value, High-Risk Items, Active Discount Offers
- 7-day Waste Trend chart — AI line vs Baseline line (Recharts AreaChart)
- Live Event Feed — real-time POS sales, inventory changes, expiry alerts via SSE
- High-Risk Items table — products expiring within 24 hours

**Who it helps:**
Restaurant managers and owners — a single morning check shows today's situation, risks, and what AI has already acted on.

---

### 2. 📦 Inventory — Stock & Risk Monitor
**Route:** `/inventory`

Full inventory visibility with AI-enriched risk scoring on every product.

**Contents:**
- Complete list of 25 products with quantity, unit, expiry date
- AI-calculated risk badge per item: **HIGH** / **MEDIUM** / **LOW**
- 3-day demand forecast per product
- Surplus quantity (stock minus expected demand)
- Reorder flag when stock falls below reorder point
- Filter by risk level, search by name/category

**Who it helps:**
Kitchen managers and store-room staff — know exactly which products to use first (highest risk first), and which are safely stocked.

---

### 3. 🤖 AI Decisions — Multi-Agent Pipeline
**Route:** `/agents`

Transparent view into the AI decision-making pipeline. Run all 6 agents and see each one's reasoning.

**Agents:**

| Agent | Role |
|-------|------|
| **DemandAgent** | Forecasts 7-day demand using weighted moving average + day-of-week seasonality |
| **InventoryAgent** | Categorises all stock into HIGH / MEDIUM / LOW risk buckets |
| **WasteAgent** | Calculates spoilage probability for every SKU (quantity vs demand vs shelf life) |
| **MarketAgent** | Retrieves relevant Bangladesh market context via RAG (prices, seasons, holidays) |
| **PricingAgent** | Generates discount recommendations for all at-risk items |
| **ProcurementAgent** | Outputs BUY / DO NOT BUY decisions per product with estimated cost |
| **OrchestratorAgent** | Synthesises all agent outputs into one final actionable decision |

**Example Orchestrator output:**
```
FINAL DECISION: APPLY_DISCOUNTS
Reasoning: 3 products require dynamic discounting to prevent waste.
Priority Actions:
  → DISCOUNT: Chicken Sandwich — Apply 34% discount (৳280 → ৳185) [CRITICAL]
  → DISCOUNT: Beef Biriyani — Apply 30% discount (৳350 → ৳245) [HIGH]
  → ORDER: Basmati Rice — Order 20 kg (est. ৳2,400) [MEDIUM]
```

**Who it helps:**
Operations managers and supply chain leads — full transparency into *why* AI made each decision, not just what it decided.

---

### 4. 💰 Dynamic Pricing — Flash Discount Engine
**Route:** `/pricing`

Automatically generated flash discount offers for at-risk inventory, with approve/reject controls.

**Contents:**
- Flash Offer cards for every at-risk product (up to 10)
- Each card shows: original price, discounted price, % off, waste risk %, expiry countdown, AI explanation
- **Approve** button — activates the discount
- **Reject** button — dismisses the recommendation
- Pricing algorithm is fully deterministic (no AI hallucination risk):

| Waste Risk | Discount Applied |
|-----------|-----------------|
| < 30% | 0% (no action) |
| 30–50% | 5–10% |
| 50–70% | 10–20% |
| 70–85% | 20–30% |
| > 85% (Critical) | Maximum within margin floor |

**Example offer:**
> ~~৳280~~ → **৳185** · **34% OFF**  
> *"Chicken Sandwich (Ready) has 100% waste risk with 0 hours remaining. Surplus of 22 units exceeds forecast demand of 20. Immediate discount recommended to maximise sell-through."*

**Who it helps:**
Restaurant floor managers — instead of throwing away food at closing time, discounts move product and recover revenue that would otherwise be a total loss.

---

### 5. 📸 Shelf Vision — AI Image Analysis
**Route:** `/vision`

Upload any shelf or store image and get a structured inventory estimate using Gemini Vision AI.

**Contents:**
- Drag-and-drop image uploader (JPEG/PNG/WebP)
- 3 built-in demo scenarios (vegetables, chilled proteins, bakery)
- Results table: item name, estimated quantity, unit, confidence %, condition, category
- Shelf condition assessment: well-stocked / adequate / low-stock / empty
- Low-stock area notes
- Label on all results: **"AI estimate — verify manually"**

**Output format:**
```json
{
  "item": "Tomato",
  "estimated_quantity": 12,
  "unit": "kg",
  "confidence": 0.86,
  "condition": "good",
  "category": "Vegetable"
}
```

**Who it helps:**
Warehouse staff — take a photo instead of manually counting. Faster stock-takes, fewer counting errors, and AI flags low-stock areas immediately.

> **Note:** Requires a Gemini API key for real image analysis. Demo fallback data is provided without a key.

---

### 6. 🌐 Market Intelligence — RAG Pipeline
**Route:** `/market`

A Retrieval-Augmented Generation (RAG) system grounded in a local Bangladesh market knowledge base.

**Knowledge Base (18 documents):**
- Karwan Bazar wholesale prices for proteins, vegetables, dairy
- Ramadan / Eid demand surge patterns
- Halal certification requirements (BSTI)
- Tropical climate shelf-life guidelines (25–35°C)
- Supplier lead times with Dhaka traffic constraints
- Winter vegetable harvest pricing impacts
- Cold chain requirements for poultry and dairy
- Seasonal fishery cycles (Hilsa ban periods)

**How it works:**
```
User Query → BM25 Keyword Retrieval → Top-5 Relevant Documents
           → Context Assembly → Gemini Synthesis → Structured Answer
```

**Example query:** *"How will Ramadan affect chicken demand and overnight spoilage?"*  
**Answer:** Retrieved 5 docs → AI synthesises: *"Ramadan drives 40–60% protein demand surge during Iftar hours. Overnight storage risk doubles — reduce pre-cooked quantities after 10 PM and apply aggressive morning discounts."*

**Who it helps:**
Purchasing departments — make procurement decisions grounded in real local market data, not guesswork.

---

### 7. 🧪 Simulation Lab — Waste Reduction Benchmark
**Route:** `/simulation`

An empirical Monte Carlo simulation comparing traditional ordering vs WASTELENS AI over 30 days.

**Contents:**
- Configurable time horizon: 7 / 14 / 30 / 60 days
- Toggle individual AI modules on/off:
  - ✅ Demand Forecast Agent
  - ✅ Dynamic Pricing Engine
  - ✅ Smart Procurement
- Cumulative Waste Trajectory chart — visual divergence of AI vs Baseline day by day
- Summary metrics: total purchased, total sold, total wasted, revenue, gross profit
- Product-level breakdown table: per-SKU waste reduction %
- CO₂e avoided (using 2.5 kg CO₂e per kg food waste standard)

**Formula:**
```
Waste Reduction % = (Baseline Waste − AI Waste) / Baseline Waste × 100
```

**Typical results:**

| Metric | Baseline | WASTELENS AI |
|--------|---------|--------------|
| Total Waste | ~1,400 kg | ~148 kg |
| Waste Reduction | — | **89.7%** |
| Revenue | ৳8.2L | ৳9.1L |
| Gross Profit | ৳4.1L | ৳5.3L |
| Food Rescued | — | 1,252 kg |
| CO₂e Avoided | — | 3,130 kg |

> **Important:** This is a SIMULATED BENCHMARK RESULT using synthetic restaurant data. Never claimed as a guaranteed real-world outcome.

**Who it helps:**
Investors, board members, and management — see the business case for AI-driven waste prevention with hard numbers before committing to full deployment.

---

### 8. 🏛 Architecture — Technical Diagram
**Route:** `/architecture`

An interactive 5-layer system architecture explorer for technical audiences.

**Contents:**
- Clickable layer cards: Data Sources → Ingestion → Agent Pipeline → Decision Engine → Impact Engine
- Each layer shows components, technologies, and data flows
- Full Mermaid diagram source code (copy-ready for documentation)
- Technology stack summary

**Who it helps:**
Technical reviewers, hackathon judges, and engineering teams evaluating the solution.

---

### 9. 💬 AI Copilot — Conversational Assistant
**Route:** `/copilot`

A multi-turn chat interface grounded in live application data — not generic AI responses.

**Contents:**
- Chat interface with message history
- 5 suggested quick-start questions:
  - "What should I buy today?"
  - "Which products are at highest waste risk?"
  - "Why did AI recommend a discount?"
  - "Which inventory should I use first?"
  - "What is causing today's waste?"
- Answers reference actual live inventory, risk scores, and waste records
- Powered by Gemini (with deterministic rule-based fallback)

**Example exchange:**
> **User:** Which products are at highest waste risk?  
> **Copilot:** 🚨 High Waste Risk Items (next 48 hours):  
> • **Chicken Sandwich (Ready)**: 42 units, expires in 0h  
> • **Beef Biriyani (Ready)**: 35 units, expires in 0h  
> • **Vegetable Samosa**: 85 units, expires in 0h  
> *Recommendation: Apply dynamic discounts immediately. See Dynamic Pricing page.*

**Who it helps:**
Any staff member — even without dashboard training, they can ask plain-language questions and get actionable answers instantly.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ 
- A Gemini API key (optional — app works fully in fallback mode without it)

### 1. Start the Backend

```powershell
cd wastelens-ai\server
npm install          # only needed first time
node --experimental-fetch src/index.js
```

Expected output:
```
✅ Database ready (25 products loaded)
🚀 WASTELENS AI Server running on http://localhost:3001
🤖 Gemini API: ✅ Configured   (or ⚠️ Not configured — using fallback)
📡 Real-time event stream initialized
```

### 2. Start the Frontend

```powershell
cd wastelens-ai\client
npm install          # only needed first time
npx vite --port 5173
```

Then open **http://localhost:5173**

---

## 🔑 Enable Gemini AI (Optional)

Create `server/.env`:

```env
GEMINI_API_KEY=your_key_here
PORT=3001
NODE_ENV=development
```

Restart the backend server. Features unlocked with a key:

| Feature | Without Key | With Gemini Key |
|---------|-------------|-----------------|
| All dashboard data | ✅ Full | ✅ Full |
| Inventory & risk scoring | ✅ Full | ✅ Full |
| Simulation Lab | ✅ Full | ✅ Full |
| Dynamic Pricing algorithm | ✅ Full | ✅ Full |
| RAG document retrieval | ✅ Full | ✅ Full |
| Pricing explanation text | ✅ Rule-based | ✅ AI-generated |
| Agent reasoning summaries | ✅ Rule-based | ✅ AI-generated |
| RAG synthesis answers | ✅ Excerpt-based | ✅ AI-synthesised |
| AI Copilot responses | ✅ Rule-based | ✅ Full Gemini chat |
| Shelf Vision (image upload) | ✅ Demo data | ✅ Real image analysis |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite 4 | UI framework |
| Styling | Tailwind CSS 3 | Dark-theme design system |
| Charts | Recharts 2 | Waste trend, simulation, forecast charts |
| Icons | Lucide React | Consistent icon set |
| Backend | Node.js 16 + Express (ESM) | REST API server |
| Database | sql.js (pure JS SQLite) | No-compile embedded database |
| AI | Google Gemini `gemini-3.8-flash` | Agent reasoning, vision, copilot, RAG |
| SDK | `@google/genai` (Interactions API) | Gemini API client |
| Real-time | Server-Sent Events (SSE) | Live event stream |
| ORM layer | Custom `wrapDb()` wrapper | better-sqlite3-compatible API over sql.js |

---

## 📁 Project Structure

```
wastelens-ai/
│
├── server/
│   ├── .env                     ← GEMINI_API_KEY goes here
│   ├── package.json
│   └── src/
│       ├── index.js             ← Express app entry point
│       ├── polyfill.js          ← Node 16 Web Streams polyfill
│       ├── db/
│       │   ├── database.js      ← sql.js init + wrapDb() compatibility layer
│       │   └── seed.js          ← 25 products, 750 sales, 18 market knowledge docs
│       ├── routes/
│       │   ├── dashboard.js     ← GET /api/dashboard
│       │   ├── inventory.js     ← GET /api/inventory, /api/inventory/risk
│       │   ├── forecast.js      ← GET /api/forecast/all, POST /api/forecast
│       │   ├── agents.js        ← POST /api/agents/run, GET /api/agents/decisions
│       │   ├── pricing.js       ← GET /api/pricing/recommendations, POST /approve|reject
│       │   ├── simulation.js    ← POST /api/simulation/run
│       │   ├── rag.js           ← POST /api/rag/query, GET /api/rag/knowledge
│       │   ├── vision.js        ← POST /api/vision/analyze
│       │   ├── events.js        ← GET /api/events (SSE stream)
│       │   └── copilot.js       ← POST /api/copilot/chat
│       └── services/
│           ├── forecastEngine.js      ← Weighted moving avg + DOW seasonality
│           ├── wasteEngine.js         ← Deterministic waste risk calculation
│           ├── pricingEngine.js       ← Margin-bounded discount algorithm
│           ├── simulationEngine.js    ← 30-day Monte Carlo baseline vs AI
│           ├── ragService.js          ← BM25-style keyword retrieval
│           ├── geminiService.js       ← All Gemini API calls (centralised)
│           ├── agentOrchestrator.js   ← 6 agents + orchestrator pipeline
│           ├── visionService.js       ← Gemini Vision + demo fallback
│           ├── eventStream.js         ← SSE broadcaster, 5–8s interval
│           └── copilotService.js      ← Copilot context builder + fallback
│
├── client/
│   ├── package.json
│   ├── vite.config.js           ← Proxy /api → localhost:3001
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx              ← React Router setup
│       ├── index.css            ← Dark theme + utility classes
│       ├── context/
│       │   └── EventContext.jsx ← SSE connection with auto-reconnect
│       ├── services/
│       │   └── api.js           ← All backend API calls centralised
│       ├── components/
│       │   ├── Layout.jsx       ← Sidebar navigation
│       │   ├── LiveEventFeed.jsx← SSE event display
│       │   └── DemoRunner.jsx   ← 10-step demo modal
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Inventory.jsx
│           ├── AIDecisions.jsx
│           ├── DynamicPricing.jsx
│           ├── ShelfVision.jsx
│           ├── MarketIntelligence.jsx
│           ├── SimulationLab.jsx
│           ├── Architecture.jsx
│           └── AICopilot.jsx
│
└── README.md                    ← This file
```

---

## ✅ Competition Requirements Checklist

| Requirement | Status | Evidence |
|-------------|--------|---------|
| ≥ 30% simulated waste reduction | ✅ **89.7%** | Simulation Lab, Demo Button |
| Predictive demand forecasting | ✅ | ForecastEngine — weighted MA + DOW seasonality |
| Real-time data ingestion | ✅ | SSE stream, 5–8s simulated events |
| AI inventory optimization | ✅ | InventoryAgent + risk scoring |
| Vision-based shelf monitoring | ✅ | Gemini Vision + demo fallback |
| Autonomous AI agents | ✅ | 6 specialised agents + Orchestrator |
| Automated dynamic discounting | ✅ | PricingEngine — algorithmic 0–38% discount |
| RAG market intelligence | ✅ | 18 Bangladesh market docs, BM25 retrieval |
| Logistics/procurement constraints | ✅ | Lead times, budget caps, Halal rules |
| Technical architecture diagram | ✅ | Architecture page + Mermaid |
| Multimodal AI (image) | ✅ | Shelf Vision with Gemini Vision API |
| Measurable impact metrics | ✅ | CO₂e avoided, food rescued kg, revenue delta |
| Gemini API key never in frontend | ✅ | All calls via Express backend only |
| Simulated data clearly labelled | ✅ | 🧪 Demo badge on every page, every API response |
| No hardcoded "30%" | ✅ | Calculated: `(baseline - ai) / baseline * 100` |

---

## ⚙️ Important Implementation Notes

### Why sql.js instead of better-sqlite3?
`better-sqlite3` requires Python + node-gyp for native compilation, which failed on this Node 16 environment. `sql.js` is pure JavaScript, zero compilation required.

### Why `--experimental-fetch`?
`@google/genai` uses the Fetch API internally. Node 16 doesn't include Fetch natively — the flag enables the experimental built-in. Node 18+ doesn't need this flag.

### Deterministic vs AI calculations
Per competition rules and best engineering practice:

| Uses deterministic code | Uses Gemini AI |
|------------------------|---------------|
| Demand forecasting | Agent reasoning summaries |
| Waste risk scoring | Pricing explanation text |
| Discount calculation | RAG answer synthesis |
| Simulation numbers | Copilot conversational answers |
| All financial KPIs | Shelf image analysis |

This keeps the prototype technically credible — AI explains decisions, math makes them.

---

## 📊 Seeded Demo Data

The database is pre-populated with realistic Bangladesh restaurant data:

- **25 products** — chicken, beef, hilsa fish, vegetables, dairy, rice, biriyani, sandwiches
- **750 sales records** — 30 days of history across all products
- **70 waste records** — historical waste patterns
- **18 market knowledge documents** — Karwan Bazar prices, seasonal trends, supplier info, shelf-life guides, Halal rules, logistics constraints
- **Currency:** BDT (৳) throughout
- **Context:** Dhaka restaurant — Ramadan demand patterns, tropical shelf-life, Halal compliance

---

*WASTELENS AI — Built to prove that intelligent systems can make food waste a solvable problem, one restaurant at a time.*
