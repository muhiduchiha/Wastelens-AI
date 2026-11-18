import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FlaskConical, Play, CheckCircle, AlertTriangle, TrendingDown,
  DollarSign, Leaf, Wind, RefreshCw, Sliders, ChevronRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const fmt = (n) => new Intl.NumberFormat('en-BD').format(n);
const fmtTaka = (n) => `৳${fmt(Math.round(n))}`;

export default function SimulationLab() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [config, setConfig] = useState({
    days: 30,
    enable_forecasting: true,
    enable_dynamic_pricing: true,
    enable_smart_procurement: true,
  });

  const runSim = async () => {
    setRunning(true);
    try {
      const res = await api.runSimulation(config);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    // Run an initial 30-day simulation on page load
    runSim();
  }, []);

  const baseline = result?.baseline || {};
  const ai = result?.ai_optimized || {};
  const comp = result?.comparison || {};
  const dailyData = result?.daily_comparison || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <FlaskConical className="w-7 h-7 text-emerald-400" />
            Waste Reduction Simulation Lab
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Empirical benchmark comparing traditional heuristic ordering vs. WASTELENS AI multi-agent orchestration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="demo-badge">SIMULATED BENCHMARK RESULT</span>
          <button
            onClick={runSim}
            disabled={running}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {running ? 'Simulating 30 Days...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* Control Panel: Simulation Levers */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between border-b border-[#2a2d3e] pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Simulation Parameters & AI Module Toggles
          </div>
          <span className="text-xs text-gray-500 font-mono">Formula: ((Baseline - AI) / Baseline) × 100</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Time Horizon (Days)</label>
            <select
              value={config.days}
              onChange={(e) => setConfig({ ...config, days: parseInt(e.target.value) })}
              className="w-full bg-[#13151f] border border-[#2a2d3e] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value={7}>7 Days (Short Cycle)</option>
              <option value={14}>14 Days (Bi-weekly)</option>
              <option value={30}>30 Days (Standard Month)</option>
              <option value={60}>60 Days (Quarterly Lookahead)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#13151f] rounded-lg border border-[#2a2d3e]">
            <div>
              <div className="text-xs font-medium text-white">Demand Forecast Agent</div>
              <div className="text-[10px] text-gray-400">Day-of-week seasonality</div>
            </div>
            <input
              type="checkbox"
              checked={config.enable_forecasting}
              onChange={(e) => setConfig({ ...config, enable_forecasting: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded bg-[#1a1d2e] border-gray-700"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#13151f] rounded-lg border border-[#2a2d3e]">
            <div>
              <div className="text-xs font-medium text-white">Dynamic Pricing Engine</div>
              <div className="text-[10px] text-gray-400">Automated flash sales</div>
            </div>
            <input
              type="checkbox"
              checked={config.enable_dynamic_pricing}
              onChange={(e) => setConfig({ ...config, enable_dynamic_pricing: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded bg-[#1a1d2e] border-gray-700"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#13151f] rounded-lg border border-[#2a2d3e]">
            <div>
              <div className="text-xs font-medium text-white">Procurement Optimizer</div>
              <div className="text-[10px] text-gray-400">Buffer sizing & lead timing</div>
            </div>
            <input
              type="checkbox"
              checked={config.enable_smart_procurement}
              onChange={(e) => setConfig({ ...config, enable_smart_procurement: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded bg-[#1a1d2e] border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Target Achievement Banner */}
      {result && (
        <div
          className={`card border ${
            comp.target_achieved
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl ${
                  comp.target_achieved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {comp.waste_reduction_pct}%
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-2 text-white">
                  {comp.target_achieved ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Competition Challenge Target Achieved (≥ 30% Food Waste Reduction)
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Target Below 30% Threshold
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  Simulated over {config.days} days with identical demand volatility curves. Baseline wasted{' '}
                  <strong className="text-red-400">{baseline.total_waste_kg} kg</strong> vs WASTELENS AI{' '}
                  <strong className="text-emerald-400">{ai.total_waste_kg} kg</strong>.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-[#13151f] px-3 py-2 rounded-lg border border-[#2a2d3e]">
                <div className="text-gray-400">Food Rescued</div>
                <div className="text-base font-bold text-white">{comp.food_rescued_kg} kg</div>
              </div>
              <div className="bg-[#13151f] px-3 py-2 rounded-lg border border-[#2a2d3e]">
                <div className="text-gray-400">Carbon Avoided</div>
                <div className="text-base font-bold text-cyan-400">{comp.co2e_avoided_kg} kg CO₂e</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Baseline vs AI Metric Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline Card */}
        <div className="card border-red-500/20 bg-red-500/5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2a2d3e] pb-3">
            <div>
              <span className="text-xs uppercase font-semibold text-red-400 tracking-wider">Strategy A</span>
              <h3 className="text-base font-bold text-white">Baseline (Manual Heuristic)</h3>
            </div>
            <span className="badge-risk-high text-[11px]">Unoptimized</span>
          </div>

          <p className="text-xs text-gray-400">
            Standard 30% static over-ordering buffer to prevent stockouts, no dynamic markdown discounting, linear FIFO usage without spoilage risk priority.
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#13151f] p-3 rounded-xl border border-[#2a2d3e]">
              <div className="text-xs text-gray-400">Total Food Wasted</div>
              <div className="text-xl font-bold text-red-400 mt-1">{baseline.total_waste_kg || 0} kg</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{baseline.waste_pct || 0}% of all purchases</div>
            </div>
            <div className="bg-[#13151f] p-3 rounded-xl border border-[#2a2d3e]">
              <div className="text-xs text-gray-400">Total Food Purchased</div>
              <div className="text-xl font-bold text-white mt-1">{baseline.total_purchased_kg || 0} kg</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Cost: {fmtTaka(baseline.total_cost || 0)}</div>
            </div>
            <div className="bg-[#13151f] p-3 rounded-xl border border-[#2a2d3e]">
              <div className="text-xs text-gray-400">Gross Sales Revenue</div>
              <div className="text-xl font-bold text-white mt-1">{fmtTaka(baseline.total_revenue || 0)}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Sold: {baseline.total_sold_kg || 0} kg</div>
            </div>
            <div className="bg-[#13151f] p-3 rounded-xl border border-[#2a2d3e]">
              <div className="text-xs text-gray-400">Gross Profit (Margin)</div>
              <div className="text-xl font-bold text-gray-300 mt-1">{fmtTaka(baseline.gross_profit || 0)}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">After spoilage write-offs</div>
            </div>
          </div>
        </div>

        {/* WASTELENS AI Card */}
        <div className="card border-emerald-500/30 bg-emerald-500/5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2a2d3e] pb-3">
            <div>
              <span className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">Strategy B</span>
              <h3 className="text-base font-bold text-white">WASTELENS AI (Multi-Agent)</h3>
            </div>
            <span className="badge-risk-low text-[11px]">AI Autonomous</span>
          </div>

          <p className="text-xs text-gray-400">
            Demand-aligned orders with dynamic buffer, automated algorithm markdown discounting before expiration, and multi-agent purchase gating.
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#13151f] p-3 rounded-xl border border-[#2a2d3e]">
              <div className="text-xs text-gray-400">Total Food Wasted</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{ai.total_waste_kg || 0} kg</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">{ai.waste_pct || 0}% of all purchases</div>
            </div>
            <div className="bg-[#13151f] p-3 rounded-xl border border-[#2a2d3e]">
              <div className="text-xs text-gray-400">Total Food Purchased</div>
              <div className="text-xl font-bold text-white mt-1">{ai.total_purchased_kg || 0} kg</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Cost: {fmtTaka(ai.total_cost || 0)}</div>
            </div>
            <div className="bg-[#13151f] p-3 rounded-xl border border-[#2a2d3e]">
              <div className="text-xs text-gray-400">Gross Sales Revenue</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">{fmtTaka(ai.total_revenue || 0)}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                Includes {fmtTaka(ai.discount_revenue || 0)} recovered via discounts
              </div>
            </div>
            <div className="bg-[#13151f] p-3 rounded-xl border border-[#2a2d3e]">
              <div className="text-xs text-gray-400">Gross Profit (Margin)</div>
              <div className="text-xl font-bold text-white mt-1">{fmtTaka(ai.gross_profit || 0)}</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">
                +{fmtTaka((ai.gross_profit || 0) - (baseline.gross_profit || 0))} improvement
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cumulative Waste Trajectory Chart */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-base">Cumulative Waste Accumulation (kg)</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Day-by-day trajectory demonstrating divergent waste paths over time.
            </p>
          </div>
          <span className="demo-badge">Trajectory Chart</span>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
            <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 11 }} />
            <YAxis label={{ value: 'Cumulative Waste (kg)', angle: -90, position: 'insideLeft', offset: 10 }} tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: 8 }} />
            <Legend verticalAlign="top" height={36} />
            <Area
              type="monotone"
              name="Baseline Waste (kg)"
              dataKey="baseline_cumulative"
              stroke="#ef4444"
              fill="#ef444420"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              name="WASTELENS AI Waste (kg)"
              dataKey="ai_cumulative"
              stroke="#22c55e"
              fill="#22c55e20"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Product-by-Product Comparison Table */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-base">Product-Level Waste Benchmark Table</h3>
          <span className="text-xs text-gray-400 font-mono">12 Key Perishables</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2d3e] text-gray-400">
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Baseline Purchased</th>
                <th className="pb-3 font-medium text-red-400">Baseline Wasted</th>
                <th className="pb-3 font-medium">AI Purchased</th>
                <th className="pb-3 font-medium text-emerald-400">AI Wasted</th>
                <th className="pb-3 font-medium">Waste Reduction %</th>
                <th className="pb-3 font-medium">Revenue Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3e]">
              {baseline.product_results?.map((bItem, idx) => {
                const aiItem = ai.product_results?.find((a) => a.product_id === bItem.product_id) || {};
                const reduction =
                  bItem.wasted > 0
                    ? (((bItem.wasted - (aiItem.wasted || 0)) / bItem.wasted) * 100).toFixed(1)
                    : '0.0';

                return (
                  <tr key={idx} className="text-gray-300 hover:bg-white/5">
                    <td className="py-2.5 font-medium text-white">{bItem.product_name}</td>
                    <td className="py-2.5 font-mono">{bItem.purchased} kg</td>
                    <td className="py-2.5 font-mono text-red-400 font-semibold">{bItem.wasted} kg</td>
                    <td className="py-2.5 font-mono">{aiItem.purchased || 0} kg</td>
                    <td className="py-2.5 font-mono text-emerald-400 font-semibold">{aiItem.wasted || 0} kg</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        -{reduction}%
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-gray-300">
                      {fmtTaka((aiItem.revenue || 0) - (bItem.revenue || 0))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
