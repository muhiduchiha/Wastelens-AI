import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useEvents } from '../context/EventContext';
import {
  TrendingDown, Leaf, DollarSign, Zap, AlertTriangle,
  Package, Activity, Clock, RefreshCw, Wind
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, Legend
} from 'recharts';
import LiveEventFeed from '../components/LiveEventFeed';

const fmt = (n) => new Intl.NumberFormat('en-BD').format(n);
const fmtTaka = (n) => `৳${fmt(Math.round(n))}`;

function KPICard({ label, value, sub, icon: Icon, color = 'emerald', trend }) {
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-400/10',
    red: 'text-red-400 bg-red-400/10',
    amber: 'text-amber-400 bg-amber-400/10',
    cyan: 'text-cyan-400 bg-cyan-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
    blue: 'text-blue-400 bg-blue-400/10',
  };
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        {trend && <span className={`text-xs ${trend > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{trend > 0 ? '↑' : '↓'}{Math.abs(trend)}%</span>}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { events } = useEvents();

  async function load() {
    try {
      setLoading(true);
      const d = await api.getDashboard();
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Refresh on new events
  useEffect(() => {
    if (events.length > 0 && events[0].type === 'pos_sale') {
      // Debounce refresh
      const t = setTimeout(load, 2000);
      return () => clearTimeout(t);
    }
  }, [events]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <Activity className="w-8 h-8 text-emerald-400 animate-pulse mx-auto" />
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <div className="text-red-400">Error: {error}</div>
        <button onClick={load} className="btn-secondary">Retry</button>
      </div>
    </div>
  );

  const kpis = data?.kpis || {};
  const wasteTrend = data?.waste_trend || [];
  const highRisk = data?.high_risk_items || [];

  // Build chart data from waste trend
  const chartData = wasteTrend.map(w => ({
    date: w.waste_date?.slice(5), // MM-DD
    'AI Waste': parseFloat(w.kg_wasted?.toFixed(1) || 0),
    'Baseline': parseFloat((w.kg_wasted * 1.48).toFixed(1)),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Control Center</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time food waste prevention intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="demo-badge">🧪 Simulated Demo Data</span>
          <button onClick={load} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Waste Today"
          value={`${kpis.waste_today_kg?.toFixed(1) || 0}kg`}
          sub={fmtTaka(kpis.waste_today_value || 0) + ' value lost'}
          icon={TrendingDown}
          color="red"
        />
        <KPICard
          label="Waste Reduction"
          value={`${kpis.waste_reduction_pct || 0}%`}
          sub={`vs baseline (this week)`}
          icon={Zap}
          color="emerald"
        />
        <KPICard
          label="Food Rescued"
          value={`${kpis.food_rescued_kg?.toFixed(1) || 0}kg`}
          sub="This week vs baseline"
          icon={Leaf}
          color="emerald"
        />
        <KPICard
          label="CO₂e Avoided"
          value={`${kpis.co2e_avoided_kg?.toFixed(1) || 0}kg`}
          sub="Estimated carbon saved"
          icon={Wind}
          color="cyan"
        />
        <KPICard
          label="Money Saved"
          value={fmtTaka(kpis.money_saved || 0)}
          sub="Waste value prevented"
          icon={DollarSign}
          color="emerald"
        />
        <KPICard
          label="Inventory Value"
          value={fmtTaka(kpis.inventory_value || 0)}
          sub="Total stock at cost"
          icon={Package}
          color="blue"
        />
        <KPICard
          label="High-Risk Items"
          value={kpis.high_risk_count || 0}
          sub="Expiring within 24h"
          icon={AlertTriangle}
          color="amber"
        />
        <KPICard
          label="Active Offers"
          value={kpis.active_offers || 0}
          sub="AI discount recommendations"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Charts + Risk + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waste Trend Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Waste Trend — AI vs Baseline</h3>
              <p className="text-xs text-gray-400 mt-0.5">7-day comparison (kg)</p>
            </div>
            <span className="demo-badge">simulated</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1d2e', border: '1px solid #2a2d3e', borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="Baseline" stroke="#ef4444" fill="#ef444415" strokeWidth={2} />
              <Area type="monotone" dataKey="AI Waste" stroke="#22c55e" fill="#22c55e15" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Live Events */}
        <div className="card">
          <h3 className="font-semibold text-white mb-3">Live Events</h3>
          <LiveEventFeed maxItems={8} />
        </div>
      </div>

      {/* High Risk Items */}
      {highRisk.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              High-Risk Items — Expiring Soon
            </h3>
            <span className="text-xs text-gray-400">{highRisk.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-[#2a2d3e]">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium">Quantity</th>
                  <th className="pb-2 font-medium">Expires</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2d3e]">
                {highRisk.map((item, i) => (
                  <tr key={i} className="text-gray-300">
                    <td className="py-2.5 font-medium text-white">{item.name}</td>
                    <td className="py-2.5 text-gray-400">{item.category}</td>
                    <td className="py-2.5">{item.quantity}</td>
                    <td className="py-2.5">
                      <span className={`${item.hours_to_expiry <= 12 ? 'text-red-400' : 'text-amber-400'} font-mono text-xs`}>
                        {item.hours_to_expiry <= 0 ? 'EXPIRED' : `${item.hours_to_expiry}h`}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={item.hours_to_expiry <= 12 ? 'badge-risk-high' : 'badge-risk-medium'}>
                        {item.hours_to_expiry <= 12 ? 'CRITICAL' : 'AT RISK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
