import { useState } from 'react';
import {
  Network, Database, Cpu, Zap, Layers, Server, Eye,
  ArrowDown, ArrowRight, ShieldCheck, CheckCircle2, Copy, Check
} from 'lucide-react';

export default function Architecture() {
  const [copied, setCopied] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState('agents');

  const mermaidSource = `flowchart TD
    subgraph SOURCELAYER ["1. Real-Time Data Sources"]
        POS["POS Cash Register Streams"]
        INV["Warehouse & Cooler Stock"]
        VIS["Shelf Vision Camera Feeds"]
        MKT["Bangladesh Market Commodities"]
        SUP["Supplier & Traffic Logistics"]
    end

    subgraph INGESTION ["2. Event Ingestion Bus"]
        SSE["SSE / WebSocket Live Stream"]
        VALIDATOR["Schema Validation & Event Bus"]
        SQLITE[("Local SQLite + WAL Storage")]
    end

    subgraph ORCHESTRATOR ["3. Multi-Agent AI Orchestration Layer"]
        DEMAND["Demand Agent<br/>(Weighted Seasonality)"]
        INVENTORY["Inventory Agent<br/>(Days-of-Supply Buffer)"]
        WASTE["Waste Agent<br/>(Decay & Spoilage Hazard)"]
        MARKET["Market Agent<br/>(RAG + Local Karwan Bazar Intel)"]
        PRICING["Pricing Agent<br/>(Dynamic Margin-Floor Markdown)"]
        PROCUREMENT["Procurement Agent<br/>(Lead-Time Reorder Gating)"]
        ORCH["Master Orchestrator Agent<br/>(Consensus Engine)"]
    end

    subgraph DECISIONS ["4. Autonomous Decision Engine"]
        BUY_GATE["Buy / Do-Not-Buy Gating"]
        FIFO["Priority Usage Sequence"]
        DISCOUNT_ACTION["Flash Discount Offers"]
        STOCK_ALERT["Depletion Restock Signals"]
    end

    subgraph IMPACT ["5. Impact & Validation Engine"]
        SIM["30%+ Waste Reduction Simulator"]
        CO2["Carbon & Financial Ledger"]
        COPILOT["Gemini 3.8 Flash Explainable Copilot"]
    end

    POS --> SSE
    INV --> SSE
    VIS --> SSE
    MKT --> SSE
    SUP --> SSE

    SSE --> VALIDATOR
    VALIDATOR --> SQLITE
    SQLITE --> ORCH

    ORCH --> DEMAND
    ORCH --> INVENTORY
    ORCH --> WASTE
    ORCH --> MARKET
    ORCH --> PRICING
    ORCH --> PROCUREMENT

    DEMAND & INVENTORY & WASTE & MARKET & PRICING & PROCUREMENT --> ORCH

    ORCH --> BUY_GATE
    ORCH --> FIFO
    ORCH --> DISCOUNT_ACTION
    ORCH --> STOCK_ALERT

    BUY_GATE & FIFO & DISCOUNT_ACTION & STOCK_ALERT --> SIM
    SIM --> CO2
    ORCH --> COPILOT`;

  const copyMermaid = () => {
    navigator.clipboard.writeText(mermaidSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const layersInfo = {
    sources: {
      title: 'Layer 1: Real-Time Data Sources',
      icon: Database,
      color: 'text-blue-400',
      description: 'Continuous ingest of Point-of-Sale line items, storage cooler status, optical shelf photographs, local commodity trends, and supplier transit updates.',
      items: [
        { name: 'POS Cash Register Streams', detail: 'Real-time sales receipts, hourly transaction velocity, price-elasticity tags' },
        { name: 'Storage & Cooler Sensors', detail: 'Ambient temperature, batch codes, arrival dates, and product SKU metadata' },
        { name: 'Shelf Vision Cameras', detail: 'Multimodal image ingestion analyzed via Gemini 3.8 Flash visual parsing' },
        { name: 'Local Market Commodity Indices', detail: 'Dhaka Karwan Bazar wholesale price indices, seasonal festival calendars' },
        { name: 'Supplier Logistics Telemetry', detail: 'Dhaka traffic window constraints, supplier lead-time buffers (1-3 days)' }
      ]
    },
    ingestion: {
      title: 'Layer 2: Event Ingestion & Normalization Bus',
      icon: Server,
      color: 'text-cyan-400',
      description: 'Low-latency Server-Sent Events (SSE) pipeline with schema validation and SQLite WAL database persistence.',
      items: [
        { name: 'SSE Event Streamer', detail: 'Persistent HTTP connection pushing live sales, inventory deltas, and expiry alerts' },
        { name: 'Decoupled Event Bus', detail: 'Asynchronous event handler that prevents API bottlenecks under POS traffic surges' },
        { name: 'SQLite with WAL Mode', detail: 'High-concurrency local database with zero external cloud dependencies' }
      ]
    },
    agents: {
      title: 'Layer 3: Autonomous Multi-Agent Orchestrator',
      icon: Cpu,
      color: 'text-emerald-400',
      description: 'Specialized autonomous AI agents collaborating to balance demand, perishability, pricing elasticity, and procurement cost.',
      items: [
        { name: 'Demand Agent', detail: 'Weighted moving average with day-of-week seasonality (Friday/Saturday spikes in Bangladesh)' },
        { name: 'Inventory Agent', detail: 'Tracks stock levels, days-of-supply remaining, and reorder trigger points' },
        { name: 'Waste Agent', detail: 'Calculates non-linear spoilage risk combining surplus volume, expiry hours, and temperature factors' },
        { name: 'Market Intelligence (RAG) Agent', detail: 'Retrieves Bangladesh market data to contextualize local seasonal and price shocks' },
        { name: 'Pricing Agent', detail: 'Computes margin-bounded dynamic markdown discounts (0–30%) for near-expiry items' },
        { name: 'Procurement Agent', detail: 'Generates purchase orders while actively enforcing DO NOT BUY gating on overstocked perishables' },
        { name: 'Master Orchestrator', detail: 'Synthesizes agent recommendations into a single explainable operational action plan' }
      ]
    },
    decisions: {
      title: 'Layer 4: Autonomous Decision Engine',
      icon: Zap,
      color: 'text-amber-400',
      description: 'Translates agent consensus into operational actions executed automatically or queued for manager approval.',
      items: [
        { name: 'Procurement Gating', detail: 'Blocks unnecessary purchase orders when spoilage risk exceeds projected market advantage' },
        { name: 'Automated Flash Markdowns', detail: 'Pushes instant discount offers to restaurant POS/digital displays before food expires' },
        { name: 'FIFO Priority Routing', detail: 'Instructs kitchen staff which batch IDs to cook first based on hazard ranking' }
      ]
    },
    impact: {
      title: 'Layer 5: Impact & Simulation Verification Engine',
      icon: ShieldCheck,
      color: 'text-purple-400',
      description: 'Calculates verified waste reduction percentages, avoided carbon emissions (CO₂e), and explains decisions via Gemini Copilot.',
      items: [
        { name: '30%+ Waste Reduction Simulator', detail: 'Side-by-side Monte Carlo benchmark demonstrating quantifiable waste reduction' },
        { name: 'Carbon Impact Ledger', detail: 'Converts rescued food kg into avoided CO₂e emissions (2.5 kg CO₂e / kg food)' },
        { name: 'Explainable AI Copilot', detail: 'Conversational Gemini 3.8 Flash interface answering "Why did AI discount?" with full audit trace' }
      ]
    }
  };

  const current = layersInfo[selectedLayer];
  const CurrentIcon = current.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Network className="w-7 h-7 text-emerald-400" />
            System Architecture
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            End-to-end technical blueprint illustrating real-time data flows, predictive agent orchestration, and impact verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="demo-badge">Multi-Agent System Architecture</span>
          <button
            onClick={copyMermaid}
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Mermaid!' : 'Copy Mermaid'}
          </button>
        </div>
      </div>

      {/* Layer Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {Object.entries(layersInfo).map(([key, info]) => {
          const Icon = info.icon;
          const active = selectedLayer === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedLayer(key)}
              className={`p-3 rounded-xl border text-left transition-all ${
                active
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/5'
                  : 'border-[#2a2d3e] bg-[#1a1d2e] text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${info.color}`} />
              <div className="font-semibold text-xs text-white">{info.title.split(':')[0]}</div>
              <div className="text-[10px] text-gray-400 truncate">{info.title.split(':')[1]}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Layer Detail Card */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#13151f] border border-[#2a2d3e] flex items-center justify-center">
              <CurrentIcon className={`w-5 h-5 ${current.color}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{current.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{current.description}</p>
            </div>
          </div>
          <span className="demo-badge">Layer Verified</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {current.items.map((item, idx) => (
            <div key={idx} className="bg-[#13151f] p-3 rounded-lg border border-[#2a2d3e] space-y-1">
              <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                {item.name}
              </div>
              <div className="text-[11px] text-gray-400 leading-relaxed pl-5">
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Flow Representation */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a2d3e] pb-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Visual Predictive Data Flow
          </h3>
          <span className="text-xs text-gray-500 font-mono">Reactive Pub/Sub Pipeline</span>
        </div>

        {/* Pipeline Step Cards */}
        <div className="space-y-3">
          {/* Step 1 */}
          <div className="p-3.5 bg-[#13151f] rounded-xl border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">1</div>
              <div>
                <div className="text-xs font-bold text-white">Event Streams Ingested</div>
                <div className="text-[11px] text-gray-400">POS Sales, Inventory Scans, Shelf Images, Market Index Updates</div>
              </div>
            </div>
            <div className="text-xs font-mono text-blue-400 flex items-center gap-1">
              SSE Stream <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="flex justify-center text-gray-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Step 2 */}
          <div className="p-3.5 bg-[#13151f] rounded-xl border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">2</div>
              <div>
                <div className="text-xs font-bold text-white">Feature Engineering & Deterministic Engines</div>
                <div className="text-[11px] text-gray-400">Demand Forecast (DOW Weighted Average) + Waste Risk Hazard (Surplus × Decay)</div>
              </div>
            </div>
            <div className="text-xs font-mono text-cyan-400 flex items-center gap-1">
              Exact Math <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="flex justify-center text-gray-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Step 3 */}
          <div className="p-3.5 bg-[#13151f] rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">3</div>
              <div>
                <div className="text-xs font-bold text-white">Multi-Agent Consensus (Gemini 3.8 Flash Reasoning)</div>
                <div className="text-[11px] text-gray-400">
                  Demand + Inventory + Waste + Market RAG + Pricing + Procurement → Master Orchestrator
                </div>
              </div>
            </div>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              Agent Negotiation <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="flex justify-center text-gray-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Step 4 */}
          <div className="p-3.5 bg-[#13151f] rounded-xl border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">4</div>
              <div>
                <div className="text-xs font-bold text-white">Automated Decision Dispatch</div>
                <div className="text-[11px] text-gray-400">Flash Price Markdowns, Purchase Order Gating, Kitchen FIFO Escalation</div>
              </div>
            </div>
            <div className="text-xs font-mono text-amber-400 flex items-center gap-1">
              Action Triggered <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div className="flex justify-center text-gray-600">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Step 5 */}
          <div className="p-3.5 bg-[#13151f] rounded-xl border border-purple-500/30 bg-purple-500/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">5</div>
              <div>
                <div className="text-xs font-bold text-white">Impact Verification & Realized Waste Reduction</div>
                <div className="text-[11px] text-gray-400">
                  Calculates 30%+ simulated waste reduction, rescued food mass, and avoided CO₂e ledger
                </div>
              </div>
            </div>
            <div className="text-xs font-mono text-purple-400 font-bold">
              ≥ 30% Reduction Target Achieved
            </div>
          </div>
        </div>
      </div>

      {/* Mermaid Raw Diagram Viewer */}
      <div className="card space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-gray-400">Mermaid Architecture Definition (GitHub / Markdown Compatible):</div>
          <button
            onClick={copyMermaid}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="text-[10px] font-mono text-gray-300 bg-[#0c0e15] p-3 rounded-lg overflow-x-auto border border-[#2a2d3e]">
          {mermaidSource}
        </pre>
      </div>
    </div>
  );
}
