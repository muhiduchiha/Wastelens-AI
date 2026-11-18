// API service layer — all backend calls go through here
const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Inventory
  getInventory: () => request('/inventory'),
  getHighRisk: () => request('/inventory/risk'),

  // Forecast
  getForecastAll: () => request('/forecast/all'),
  getForecast: (productId, days = 7) => request('/forecast', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, days })
  }),

  // Agents
  runAgents: () => request('/agents/run', { method: 'POST' }),
  getAgentDecisions: () => request('/agents/decisions'),

  // Pricing
  getPricingRecommendations: () => request('/pricing/recommendations'),
  approvePricing: (id) => request(`/pricing/approve/${id}`, { method: 'POST' }),
  rejectPricing: (id) => request(`/pricing/reject/${id}`, { method: 'POST' }),

  // Simulation
  runSimulation: (config = {}) => request('/simulation/run', {
    method: 'POST',
    body: JSON.stringify(config)
  }),

  // RAG
  queryRAG: (query, category) => request('/rag/query', {
    method: 'POST',
    body: JSON.stringify({ query, category })
  }),
  getKnowledge: () => request('/rag/knowledge'),

  // Vision
  analyzeShelf: (imageBase64, mimeType = 'image/jpeg') => request('/vision/analyze', {
    method: 'POST',
    body: JSON.stringify({ image_base64: imageBase64, mime_type: mimeType })
  }),
  analyzeShelfDemo: () => request('/vision/analyze', { method: 'POST', body: '{}' }),

  // Copilot
  chatCopilot: (message, previousInteractionId = null) => request('/copilot/chat', {
    method: 'POST',
    body: JSON.stringify({ message, previous_interaction_id: previousInteractionId })
  }),
};

export function createEventSource() {
  return new EventSource('/api/events');
}
