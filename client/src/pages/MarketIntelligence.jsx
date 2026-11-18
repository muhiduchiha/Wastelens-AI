import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Globe, Search, BookOpen, Sparkles, Filter, Database, ArrowRight, Loader, Info } from 'lucide-react';

export default function MarketIntelligence() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [ragResult, setRagResult] = useState(null);
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [activeTab, setActiveTab] = useState('query'); // 'query' | 'knowledge'

  // Pre-configured questions reflecting Bangladesh restaurant context
  const sampleQueries = [
    { text: 'How will Ramadan and Eid affect protein demand and overnight spoilage?', cat: 'seasonal_trend' },
    { text: 'Current Karwan Bazar wholesale prices for chicken and beef in Dhaka', cat: 'price_data' },
    { text: 'Supplier lead times and traffic window constraints in Dhaka', cat: 'supplier_info' },
    { text: 'Shelf life rules for prepared biriyani and sandwiches in tropical heat', cat: 'shelf_life' },
    { text: 'Winter vegetable harvest pricing impact on tomato and spinach', cat: 'seasonal_trend' }
  ];

  const categories = [
    { id: '', label: 'All Knowledge Types' },
    { id: 'seasonal_trend', label: 'Seasonal & Cultural Trends' },
    { id: 'price_data', label: 'Wholesale & Retail Prices' },
    { id: 'supplier_info', label: 'Supplier Lead Times & Logistics' },
    { id: 'shelf_life', label: 'Shelf Life & Perishability Rules' },
    { id: 'market_trend', label: 'Consumer & Delivery Trends' },
    { id: 'procurement_rule', label: 'Procurement Safety Stock' },
    { id: 'events_holidays', label: 'Holidays & Event Surges' },
  ];

  useEffect(() => {
    // Load knowledge entries summary
    api.getKnowledge()
      .then(res => setKnowledgeList(res.entries || []))
      .catch(console.error);

    // Run initial RAG query for demo richness
    handleSearch('How do Karwan Bazar lead times and high temperature affect chicken shelf life?');
  }, []);

  const handleSearch = async (textToSearch = query, catFilter = category) => {
    const q = textToSearch.trim();
    if (!q) return;

    setLoading(true);
    try {
      const res = await api.queryRAG(q, catFilter || undefined);
      setRagResult(res);
      setQuery(q);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Globe className="w-7 h-7 text-cyan-400" />
            RAG Market Intelligence
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Retrieval-Augmented Generation groundings on Bangladesh food commodity cycles, Dhaka supply chain lead times, and seasonal perishability trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="demo-badge">RAG Pipeline: Ingestion → BM25 Search → Gemini 3.8</span>
          <span className="demo-badge">Bangladesh Market Context</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#2a2d3e] pb-2">
        <button
          onClick={() => setActiveTab('query')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'query'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          Market Query & AI Synthesis
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'knowledge'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          Seeded Knowledge Base ({knowledgeList.length})
        </button>
      </div>

      {activeTab === 'query' ? (
        <div className="space-y-6">
          {/* Search Bar & Category Filter */}
          <div className="card space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ask market intelligence (e.g. Dhaka egg price trends, Hilsa fish seasonality, Karwan Bazar delivery)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#13151f] border border-[#2a2d3e] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (query) handleSearch(query, e.target.value);
                }}
                className="px-3 py-2.5 bg-[#13151f] border border-[#2a2d3e] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>

              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Retrieve & Synthesize
              </button>
            </div>

            {/* Recommended Sample Questions */}
            <div>
              <div className="text-xs text-gray-400 mb-2 flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Sample Market Inquiries:
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.map((sq, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCategory(sq.cat);
                      handleSearch(sq.text, sq.cat);
                    }}
                    className="text-xs bg-[#13151f] hover:bg-[#202436] border border-[#2a2d3e] text-gray-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>{sq.text}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RAG Synthesis & Grounding Document Flow */}
          {loading ? (
            <div className="card py-16 text-center space-y-3">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div className="text-white font-medium">Querying Vector Knowledge Base...</div>
              <p className="text-xs text-gray-400">
                Ranking local commodity docs → Extracting top-K context chunks → Gemini 3.8 Flash inference
              </p>
            </div>
          ) : ragResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: AI Synthesis */}
              <div className="lg:col-span-7 space-y-4">
                <div className="card border-cyan-500/30 bg-cyan-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <h3 className="font-semibold text-white text-base">Market Agent Synthesis</h3>
                    </div>
                    <span className="demo-badge">Grounded Response</span>
                  </div>

                  <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line bg-[#13151f]/80 p-4 rounded-xl border border-[#2a2d3e]/80">
                    {ragResult.synthesis}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2a2d3e] flex items-center justify-between text-xs text-gray-400">
                    <span>Grounding Pipeline: <span className="font-mono text-cyan-400">{ragResult.pipeline}</span></span>
                    <span>Retrieved Chunks: <strong className="text-white">{ragResult.retrieved_count}</strong></span>
                  </div>
                </div>

                <div className="card-sm bg-blue-500/5 border-blue-500/20 text-xs text-gray-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-400">Anti-Hallucination Policy: </span>
                    The Market Agent is strictly bounded by deterministic document retrieval. If local pricing or holiday surge facts are missing in the knowledge vector store, the agent explicitly discloses absence rather than fabricating numbers.
                  </div>
                </div>
              </div>

              {/* Right Column: Retrieved Knowledge Documents */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    Retrieved Grounding Documents ({ragResult.retrieved_documents?.length || 0})
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">BM25 / Keyword Rank</span>
                </div>

                {ragResult.retrieved_documents?.length === 0 ? (
                  <div className="card text-center py-8 text-gray-400 text-xs">
                    No matching documents found in knowledge base for this query.
                  </div>
                ) : (
                  ragResult.retrieved_documents.map((doc, idx) => (
                    <div key={doc.id || idx} className="card-sm space-y-2 border-l-4 border-l-cyan-500">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-white text-xs leading-snug">{doc.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-400 whitespace-nowrap">
                          Score: {doc.relevance_score}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 line-clamp-3 leading-relaxed">
                        {doc.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-[#2a2d3e]">
                        <span className="capitalize">{doc.category.replace('_', ' ')}</span>
                        <span className="font-mono">{doc.source}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* Knowledge Base Catalog Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {knowledgeList.map((entry) => (
              <div key={entry.id} className="card-sm space-y-2 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {entry.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{entry.source}</span>
                </div>
                <h4 className="font-medium text-white text-sm">{entry.title}</h4>
                <div className="text-[10px] text-gray-500 font-mono">
                  Indexed: {new Date(entry.created_at).toLocaleDateString()}
                </div>
                <button
                  onClick={() => {
                    setActiveTab('query');
                    setQuery(entry.title);
                    handleSearch(entry.title, entry.category);
                  }}
                  className="w-full text-center py-1.5 bg-[#13151f] hover:bg-cyan-500/10 hover:text-cyan-400 text-gray-300 text-xs rounded transition-colors"
                >
                  Query with this context →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
