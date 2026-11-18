import { useState } from 'react';
import { api } from '../services/api';
import { Bot, Play, CheckCircle, Loader, ChevronDown, ChevronUp, Zap } from 'lucide-react';

const agentColors = {
  DemandAgent: 'text-blue-400 bg-blue-400/10',
  InventoryAgent: 'text-purple-400 bg-purple-400/10',
  WasteAgent: 'text-red-400 bg-red-400/10',
  MarketAgent: 'text-cyan-400 bg-cyan-400/10',
  PricingAgent: 'text-amber-400 bg-amber-400/10',
  ProcurementAgent: 'text-emerald-400 bg-emerald-400/10',
  OrchestratorAgent: 'text-white bg-white/10',
};

const agentIcons = {
  DemandAgent: '📊',
  InventoryAgent: '📦',
  WasteAgent: '🗑️',
  MarketAgent: '🌐',
  PricingAgent: '💰',
  ProcurementAgent: '🛒',
  OrchestratorAgent: '🤖',
};

function AgentCard({ name, data, isExpanded, onToggle }) {
  const colorClass = agentColors[name] || 'text-gray-400 bg-gray-400/10';
  const icon = agentIcons[name] || '🤖';

  return (
    <div className="card">
      <button className="w-full flex items-center justify-between" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <div>
            <div className={`font-semibold ${colorClass.split(' ')[0]}`}>{name}</div>
            <div className="text-xs text-gray-400">{data?.status || 'ready'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data?.status === 'completed' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {isExpanded && data && (
        <div className="mt-4 pt-4 border-t border-[#2a2d3e] space-y-3 animate-fade-in">
          {/* Show relevant fields based on agent */}
          {name === 'DemandAgent' && (
            <div className="space-y-2">
              <div className="text-sm text-gray-300">7-Day Total Demand: <span className="text-white font-semibold">{data.total_7day_demand}</span> units</div>
              <div className="text-sm text-gray-300">Avg Confidence: <span className="text-emerald-400 font-semibold">{Math.round(data.avg_confidence * 100)}%</span></div>
              {data.insight && <p className="text-xs text-gray-400 italic bg-[#13151f] p-3 rounded-lg">"{data.insight}"</p>}
            </div>
          )}

          {name === 'InventoryAgent' && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-red-500/10 rounded p-2"><div className="text-red-400 font-bold">{data.high_risk_count}</div><div className="text-xs text-gray-400">High Risk</div></div>
                <div className="bg-amber-500/10 rounded p-2"><div className="text-amber-400 font-bold">{data.medium_risk_count}</div><div className="text-xs text-gray-400">Medium Risk</div></div>
                <div className="bg-emerald-500/10 rounded p-2"><div className="text-emerald-400 font-bold">{data.low_risk_count}</div><div className="text-xs text-gray-400">Low Risk</div></div>
              </div>
            </div>
          )}

          {name === 'WasteAgent' && (
            <div className="space-y-2">
              <div className="text-sm text-gray-300">At-Risk Quantity: <span className="text-red-400 font-bold">{data.total_at_risk_kg}kg</span></div>
              <div className="text-sm text-gray-300">At-Risk Value: <span className="text-red-400 font-bold">৳{data.total_at_risk_value?.toLocaleString()}</span></div>
              {data.insight && <p className="text-xs text-gray-400 italic bg-[#13151f] p-3 rounded-lg">"{data.insight}"</p>}
            </div>
          )}

          {name === 'MarketAgent' && (
            <div className="space-y-2">
              <div className="text-sm text-gray-300">Documents Retrieved: <span className="text-cyan-400 font-bold">{data.retrieved_docs}</span></div>
              {data.documents?.slice(0, 3).map((d, i) => (
                <div key={i} className="text-xs bg-[#13151f] p-2 rounded text-gray-400">{d.title}</div>
              ))}
            </div>
          )}

          {name === 'PricingAgent' && (
            <div className="space-y-2">
              <div className="text-sm text-gray-300">Discount Opportunities: <span className="text-amber-400 font-bold">{data.recommendations_count}</span></div>
              {data.recommendations?.slice(0, 2).map((r, i) => (
                <div key={i} className="text-xs bg-[#13151f] p-2 rounded text-gray-400">
                  {r.product_name}: {r.discount_pct}% off → ৳{r.recommended_price}
                </div>
              ))}
            </div>
          )}

          {name === 'ProcurementAgent' && (
            <div className="space-y-2">
              <div className="text-sm text-gray-300">Purchase Actions: <span className="text-emerald-400 font-bold">{data.actions_count}</span></div>
              <div className="text-sm text-gray-300">DO NOT ORDER: <span className="text-red-400 font-bold">{data.do_not_order?.length || 0}</span> items</div>
              {data.do_not_order?.slice(0, 2).map((d, i) => (
                <div key={i} className="text-xs bg-red-500/10 border border-red-500/20 p-2 rounded text-red-400">
                  🚫 DO NOT BUY: {d.product_name}
                </div>
              ))}
            </div>
          )}

          {name === 'OrchestratorAgent' && (
            <div className="space-y-3">
              <div className={`text-sm font-bold px-3 py-2 rounded-lg ${data.final_decision?.includes('IMMEDIATE') ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                FINAL DECISION: {data.final_decision}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{data.reasoning}</p>
              {data.priority_actions?.map((a, i) => (
                <div key={i} className="text-xs bg-[#13151f] p-2 rounded flex items-center gap-2">
                  <span className={a.type === 'DISCOUNT' ? 'text-amber-400' : 'text-emerald-400'}>{a.type}</span>
                  <span className="text-gray-300">{a.action}</span>
                  <span className={`ml-auto text-[10px] ${a.urgency === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>{a.urgency}</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-[10px] text-gray-600 font-mono">{data.timestamp}</div>
        </div>
      )}
    </div>
  );
}

export default function AIDecisions() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});

  async function runAgents() {
    setLoading(true);
    try {
      const r = await api.runAgents();
      setResult(r);
      // Auto-expand orchestrator
      setExpanded({ OrchestratorAgent: true });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const agentOrder = ['DemandAgent', 'InventoryAgent', 'WasteAgent', 'MarketAgent', 'PricingAgent', 'ProcurementAgent', 'OrchestratorAgent'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Agent Decisions</h1>
          <p className="text-gray-400 text-sm mt-1">Multi-agent reasoning pipeline with orchestrated decisions</p>
        </div>
        <button onClick={runAgents} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? 'Running Agents...' : 'Run All Agents'}
        </button>
      </div>

      {!result && !loading && (
        <div className="card text-center py-16">
          <Bot className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Agent Pipeline Ready</h3>
          <p className="text-gray-500 text-sm mb-6">Click "Run All Agents" to trigger the multi-agent decision pipeline</p>
          <button onClick={runAgents} className="btn-primary inline-flex items-center gap-2">
            <Zap className="w-4 h-4" /> Run Pipeline
          </button>
        </div>
      )}

      {loading && (
        <div className="grid gap-3">
          {agentOrder.map((name, i) => (
            <div key={name} className="card flex items-center gap-3">
              <Loader className="w-4 h-4 text-emerald-400 animate-spin" />
              <span className="text-gray-400 text-sm">{name} — Processing...</span>
            </div>
          ))}
        </div>
      )}

      {result && (
        <>
          <div className="card bg-emerald-600/10 border-emerald-600/30">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-semibold text-emerald-400">Pipeline Complete — {result.duration_ms}ms</div>
                <div className="text-xs text-gray-400">
                  {result.summary?.high_risk_items} high-risk items • {result.summary?.discount_opportunities} discount opportunities • {result.summary?.procurement_actions} purchase actions
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {agentOrder.map(name => {
              const key = name.replace('Agent', '').toLowerCase();
              const agentData = result.agents?.[key];
              return (
                <AgentCard
                  key={name}
                  name={name}
                  data={agentData}
                  isExpanded={!!expanded[name]}
                  onToggle={() => setExpanded(e => ({ ...e, [name]: !e[name] }))}
                />
              );
            })}
          </div>

          <div className="text-xs text-center text-gray-500 demo-badge mx-auto w-fit">🧪 SIMULATED DEMO DATA — Agent decisions using demo inventory</div>
        </>
      )}
    </div>
  );
}
