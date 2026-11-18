import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Bot, Tag, Eye, Globe,
  FlaskConical, Network, MessageSquare, Wifi, WifiOff,
  Leaf, Zap
} from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { api } from '../services/api';
import { useState } from 'react';
import DemoRunner from './DemoRunner';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/ai-decisions', icon: Bot, label: 'AI Decisions' },
  { to: '/pricing', icon: Tag, label: 'Dynamic Pricing' },
  { to: '/vision', icon: Eye, label: 'Shelf Vision' },
  { to: '/market', icon: Globe, label: 'Market Intel' },
  { to: '/simulation', icon: FlaskConical, label: 'Simulation Lab' },
  { to: '/architecture', icon: Network, label: 'Architecture' },
  { to: '/copilot', icon: MessageSquare, label: 'AI Copilot' },
];

export default function Layout({ children }) {
  const { events, connected } = useEvents();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-[#13151f] border-r border-[#2a2d3e] flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-[#2a2d3e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-tight">WASTELENS AI</div>
              <div className="text-[10px] text-emerald-400 font-mono">Food Waste Prevention</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Status & Demo */}
        <div className="p-3 border-t border-[#2a2d3e] space-y-2">
          {/* Connection status */}
          <div className="flex items-center gap-2 px-3 py-2">
            {connected
              ? <><Wifi className="w-3.5 h-3.5 text-emerald-400" /><span className="text-xs text-emerald-400">Live Events</span></>
              : <><WifiOff className="w-3.5 h-3.5 text-red-400" /><span className="text-xs text-red-400">Reconnecting...</span></>
            }
          </div>

          {/* Demo button */}
          <button
            onClick={() => setDemoOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/40 rounded-lg text-emerald-400 text-sm font-semibold transition-all"
          >
            <Zap className="w-4 h-4" />
            Run 30%+ Demo
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 border-b border-[#2a2d3e] bg-[#13151f] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="demo-badge">🧪 Demo / Simulated Real-Time Data</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{events.length} live events</span>
            <span>•</span>
            <span>Bangladesh Restaurant Demo</span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>

      {/* Demo runner modal */}
      {demoOpen && <DemoRunner onClose={() => setDemoOpen(false)} />}
    </div>
  );
}
