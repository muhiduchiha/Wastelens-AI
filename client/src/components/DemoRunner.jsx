import { useState } from 'react';
import { X, Zap, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const STEPS = [
  'Loading demo restaurant data...',
  'Starting real-time sales events...',
  'Forecasting demand (7 days)...',
  'Detecting high-risk inventory...',
  'Running AI agents...',
  'Retrieving market context (RAG)...',
  'Generating dynamic discounts...',
  'Optimizing procurement...',
  'Running baseline vs AI simulation...',
  'Calculating final results...',
];

export default function DemoRunner({ onClose }) {
  const [step, setStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  async function runDemo() {
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      // Simulate step progress
      for (let i = 0; i < STEPS.length - 1; i++) {
        setStep(i);
        await delay(600 + Math.random() * 400);
      }

      // Run actual simulation
      setStep(STEPS.length - 1);
      const simResult = await api.runSimulation({
        days: 30,
        enable_forecasting: true,
        enable_dynamic_pricing: true,
        enable_smart_procurement: true,
      });

      setResult(simResult);
      setStep(STEPS.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  }

  const targetAchieved = result?.comparison?.target_achieved;
  const reductionPct = result?.comparison?.waste_reduction_pct;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2d3e]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-white">30%+ Waste Reduction Demo</div>
              <div className="text-xs text-gray-400">Baseline vs WASTELENS AI comparison</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Steps */}
          <div className="space-y-2">
            {STEPS.map((s, i) => {
              const done = step > i;
              const active = step === i && running;
              const pending = step < i;
              return (
                <div key={i} className={`flex items-center gap-3 text-sm transition-all ${done ? 'text-gray-300' : active ? 'text-white' : 'text-gray-600'}`}>
                  {done
                    ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    : active
                    ? <Loader className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-spin" />
                    : <div className="w-4 h-4 rounded-full border border-gray-700 flex-shrink-0" />
                  }
                  {s}
                </div>
              );
            })}
          </div>

          {/* Results */}
          {result && (
            <div className={`rounded-xl p-5 border ${targetAchieved ? 'bg-emerald-600/10 border-emerald-600/30' : 'bg-amber-600/10 border-amber-600/30'} animate-fade-in`}>
              <div className="text-center space-y-4">
                <div className="text-xs text-gray-400 font-mono">SIMULATED BENCHMARK RESULT</div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-400">{result.baseline.total_waste_kg}kg</div>
                    <div className="text-xs text-gray-400">Baseline Waste</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">{result.ai_optimized.total_waste_kg}kg</div>
                    <div className="text-xs text-gray-400">AI Waste</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${targetAchieved ? 'text-emerald-400' : 'text-amber-400'}`}>{reductionPct}%</div>
                    <div className="text-xs text-gray-400">Reduction</div>
                  </div>
                </div>

                <div className={`text-sm font-semibold ${targetAchieved ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {targetAchieved ? '✓ Competition Target Achieved (≥30%)' : `⚠️ ${reductionPct}% reduction achieved`}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-left">
                  <div className="bg-[#13151f] rounded-lg p-2">
                    <div className="text-gray-400">Food Rescued</div>
                    <div className="font-semibold text-white">{result.comparison.food_rescued_kg}kg</div>
                  </div>
                  <div className="bg-[#13151f] rounded-lg p-2">
                    <div className="text-gray-400">CO₂e Avoided</div>
                    <div className="font-semibold text-white">{result.comparison.co2e_avoided_kg}kg</div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500">
                  This is a simulated benchmark. Real-world results will vary.
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3 border border-red-500/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {!running && step === -1 && (
              <button onClick={runDemo} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                🚀 Run 30%+ Waste Reduction Demo
              </button>
            )}
            {result && (
              <button onClick={() => { setStep(-1); setResult(null); }} className="btn-secondary">
                Run Again
              </button>
            )}
            <button onClick={onClose} className="btn-secondary">
              {result ? 'View Full Simulation' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
