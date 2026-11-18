import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Tag, RefreshCw, CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';

const fmtTaka = (n) => `৳${Math.round(n).toLocaleString('en-BD')}`;

function FlashOffer({ rec, onApprove, onReject }) {
  const riskColor = rec.waste_risk > 0.7 ? 'border-red-500/40 bg-red-500/5' : rec.waste_risk > 0.4 ? 'border-amber-500/40 bg-amber-500/5' : 'border-emerald-500/40 bg-emerald-500/5';

  return (
    <div className={`card border ${riskColor} animate-fade-in`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">⚡ AI FLASH OFFER</div>
          <h3 className="text-lg font-bold text-white">{rec.product_name}</h3>
          <div className="text-xs text-gray-400">{rec.category} • {rec.quantity} units in stock</div>
        </div>
        <div className={`px-2 py-1 rounded-lg text-xs font-bold ${rec.waste_risk > 0.7 ? 'bg-red-500/20 text-red-400' : rec.waste_risk > 0.4 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {Math.round(rec.waste_risk * 100)}% RISK
        </div>
      </div>

      {/* Price display */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-[#13151f] rounded-xl">
        <div>
          <div className="text-xs text-gray-500 line-through">{fmtTaka(rec.original_price)}</div>
          <div className="text-2xl font-bold text-emerald-400">{fmtTaka(rec.recommended_price)}</div>
        </div>
        <div className="text-center px-3 py-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
          <div className="text-xl font-bold text-amber-400">{rec.discount_pct}%</div>
          <div className="text-[10px] text-amber-400">OFF</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-gray-400">Expires in</div>
          <div className="text-sm font-mono text-red-400">{(rec.days_remaining * 24).toFixed(0)}h</div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mb-4 p-3 bg-blue-500/5 border border-blue-500/15 rounded-lg">
        <div className="text-xs text-blue-400 font-semibold mb-1">Why this discount?</div>
        <p className="text-xs text-gray-300 leading-relaxed">{rec.explanation}</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
        <div className="bg-[#13151f] p-2 rounded">
          <div className="text-white font-semibold">{rec.quantity}</div>
          <div className="text-gray-500">In Stock</div>
        </div>
        <div className="bg-[#13151f] p-2 rounded">
          <div className="text-white font-semibold">{rec.demand_forecast?.toFixed(1) || 0}</div>
          <div className="text-gray-500">Expected Demand</div>
        </div>
        <div className="bg-[#13151f] p-2 rounded">
          <div className="text-white font-semibold">{rec.surplus?.toFixed(1) || 0}</div>
          <div className="text-gray-500">Surplus Units</div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={() => onApprove(rec.id || rec.product_id)} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" /> Approve Discount
        </button>
        <button onClick={() => onReject(rec.id || rec.product_id)} className="btn-danger flex items-center justify-center gap-2 px-3">
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function DynamicPricing() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState({});
  const [rejected, setRejected] = useState({});

  async function load() {
    setLoading(true);
    try {
      const d = await api.getPricingRecommendations();
      setRecs(d.recommendations || []);
    } catch (e) {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(id) {
    setApproved(a => ({ ...a, [id]: true }));
    try { await api.approvePricing(id); } catch {}
  }

  async function handleReject(id) {
    setRejected(r => ({ ...r, [id]: true }));
    try { await api.rejectPricing(id); } catch {}
  }

  const visible = recs.filter(r => !approved[r.id || r.product_id] && !rejected[r.id || r.product_id]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dynamic Pricing Engine</h1>
          <p className="text-gray-400 text-sm mt-1">AI-generated discount recommendations to prevent waste</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Algo info */}
      <div className="card bg-blue-500/5 border-blue-500/20">
        <div className="text-xs text-blue-400 font-semibold mb-2">📐 Pricing Algorithm</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-300">
          {[
            { label: 'Low Risk (<30%)', discount: '0–5% off', color: 'text-emerald-400' },
            { label: 'Medium Risk (30-50%)', discount: '5–15% off', color: 'text-amber-400' },
            { label: 'High Risk (50-85%)', discount: '15–25% off', color: 'text-orange-400' },
            { label: 'Critical (>85%)', discount: 'Up to 30% off', color: 'text-red-400' },
          ].map(r => (
            <div key={r.label} className="bg-[#13151f] p-2 rounded">
              <div className={r.color}>{r.discount}</div>
              <div className="text-gray-500">{r.label}</div>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-gray-500 mt-2">Minimum margin protected • Discount bounded by cost price + margin floor</div>
      </div>

      {loading && (
        <div className="text-center py-16">
          <Loader className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
          <div className="text-gray-400">Loading AI recommendations...</div>
        </div>
      )}

      {!loading && visible.length === 0 && recs.length === 0 && (
        <div className="card text-center py-16">
          <Tag className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <div className="text-gray-400">No pricing recommendations at this time</div>
          <div className="text-gray-500 text-sm mt-1">All inventory is within safe demand-to-stock ratios</div>
        </div>
      )}

      {!loading && visible.length === 0 && recs.length > 0 && (
        <div className="card text-center py-10">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <div className="text-emerald-400 font-semibold">All recommendations resolved</div>
          <button onClick={load} className="btn-secondary mt-4">Reload</button>
        </div>
      )}

      {/* Stats summary */}
      {recs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-amber-400">{recs.length}</div>
            <div className="text-sm text-gray-400">Total Offers</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-emerald-400">{Object.keys(approved).length}</div>
            <div className="text-sm text-gray-400">Approved</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-400">{Object.keys(rejected).length}</div>
            <div className="text-sm text-gray-400">Rejected</div>
          </div>
        </div>
      )}

      {/* Flash offers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visible.map((rec, i) => (
          <FlashOffer
            key={rec.id || rec.product_id || i}
            rec={rec}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))}
      </div>

      <div className="text-xs text-center text-gray-500 demo-badge mx-auto w-fit">🧪 SIMULATED DEMO DATA</div>
    </div>
  );
}
