import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Package, AlertTriangle, RefreshCw, TrendingDown } from 'lucide-react';

const riskColor = { HIGH: 'badge-risk-high', MEDIUM: 'badge-risk-medium', LOW: 'badge-risk-low' };
const fmtTaka = (n) => `৳${Math.round(n).toLocaleString('en-BD')}`;

export default function Inventory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  async function load() {
    setLoading(true);
    try { const d = await api.getInventory(); setData(d); } catch (e) {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const inventory = data?.inventory || [];
  const summary = data?.summary || {};
  const filtered = filter === 'ALL' ? inventory : inventory.filter(i => i.risk_level === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory Intelligence</h1>
          <p className="text-gray-400 text-sm mt-1">AI-enriched stock with waste risk scores and demand forecasts</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total SKUs', value: summary.total_items || 0, icon: Package, color: 'text-blue-400' },
          { label: 'High Risk', value: summary.high_risk || 0, icon: AlertTriangle, color: 'text-red-400' },
          { label: 'Needs Reorder', value: summary.needs_reorder || 0, icon: TrendingDown, color: 'text-amber-400' },
          { label: 'Inventory Value', value: fmtTaka(summary.total_value || 0), icon: Package, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-emerald-600 text-white' : 'bg-[#2a2d3e] text-gray-400 hover:text-white'}`}>
            {f === 'ALL' ? `All (${summary.total_items || 0})` : `${f} (${summary[f.toLowerCase() + '_risk'] || 0})`}
          </button>
        ))}
        <span className="ml-auto demo-badge self-center">🧪 Simulated Data</span>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading inventory...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-[#2a2d3e]">
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Stock</th>
                <th className="pb-3 font-medium">Expiry</th>
                <th className="pb-3 font-medium">3-Day Forecast</th>
                <th className="pb-3 font-medium">Waste Risk</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2d3e]">
              {filtered.map((item, i) => (
                <tr key={item.id || i} className="text-gray-300 hover:bg-white/2 transition-colors">
                  <td className="py-3 font-medium text-white">{item.name}</td>
                  <td className="py-3 text-gray-400 text-xs">{item.category}</td>
                  <td className="py-3">
                    <span className="font-mono">{item.quantity?.toFixed(1)}</span>
                    <span className="text-gray-500 text-xs ml-1">{item.unit}</span>
                  </td>
                  <td className="py-3">
                    <span className={`font-mono text-xs ${item.days_remaining < 1 ? 'text-red-400' : item.days_remaining < 2 ? 'text-amber-400' : 'text-gray-400'}`}>
                      {item.days_remaining < 999 ? `${(item.days_remaining * 24).toFixed(0)}h` : '—'}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-xs">{item.demand_forecast_3d?.toFixed(1)} {item.unit}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#2a2d3e] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.waste_risk > 0.7 ? 'bg-red-500' : item.waste_risk > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (item.waste_risk || 0) * 100)}%` }} />
                      </div>
                      <span className="text-xs font-mono">{Math.round((item.waste_risk || 0) * 100)}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={riskColor[item.risk_level] || 'badge-risk-low'}>
                      {item.risk_level}
                    </span>
                    {item.needs_reorder && <span className="ml-1.5 text-[10px] text-amber-400">⚠ REORDER</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
