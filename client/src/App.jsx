import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AIDecisions from './pages/AIDecisions';
import DynamicPricing from './pages/DynamicPricing';
import ShelfVision from './pages/ShelfVision';
import MarketIntelligence from './pages/MarketIntelligence';
import SimulationLab from './pages/SimulationLab';
import Architecture from './pages/Architecture';
import AICopilot from './pages/AICopilot';
import { EventProvider } from './context/EventContext';

export default function App() {
  return (
    <EventProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/ai-decisions" element={<AIDecisions />} />
          <Route path="/pricing" element={<DynamicPricing />} />
          <Route path="/vision" element={<ShelfVision />} />
          <Route path="/market" element={<MarketIntelligence />} />
          <Route path="/simulation" element={<SimulationLab />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/copilot" element={<AICopilot />} />
        </Routes>
      </Layout>
    </EventProvider>
  );
}
