import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import {
  MessageSquare, Send, Bot, User, Loader, Sparkles,
  RefreshCw, Lightbulb, AlertTriangle, Package, TrendingDown, Tag
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  { icon: Package, text: 'What should I buy today?', color: 'text-emerald-400' },
  { icon: AlertTriangle, text: 'Which products are at highest waste risk?', color: 'text-red-400' },
  { icon: Tag, text: 'Why did AI recommend a discount on Chicken Sandwich?', color: 'text-amber-400' },
  { icon: TrendingDown, text: 'Which inventory should I use first?', color: 'text-blue-400' },
  { icon: Lightbulb, text: 'What is causing today\'s food waste?', color: 'text-purple-400' },
  { icon: Sparkles, text: 'How can I reduce waste by 30% this week?', color: 'text-cyan-400' },
];

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
        isUser
          ? 'bg-blue-600/20 border border-blue-600/30'
          : 'bg-emerald-600/20 border border-emerald-600/30'
      }`}>
        {isUser
          ? <User className="w-4 h-4 text-blue-400" />
          : <Bot className="w-4 h-4 text-emerald-400" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`text-[11px] font-medium ${isUser ? 'text-blue-400 text-right' : 'text-emerald-400'}`}>
          {isUser ? 'You' : 'WASTELENS Copilot'}
          {!isUser && msg.powered_by && (
            <span className="ml-2 text-gray-500 font-mono">
              {msg.powered_by === 'gemini-3.8-flash' ? '✦ Gemini 3.8 Flash' : '⚙ Rule Engine'}
            </span>
          )}
        </div>

        <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-line ${
          isUser
            ? 'bg-blue-600/15 border border-blue-600/20 text-gray-100'
            : 'bg-[#13151f] border border-[#2a2d3e] text-gray-200'
        }`}>
          {msg.loading
            ? <span className="flex items-center gap-2 text-gray-400">
                <Loader className="w-3.5 h-3.5 animate-spin" />
                Thinking...
              </span>
            : msg.text
          }
        </div>

        {!isUser && msg.data_note && (
          <div className="text-[10px] text-gray-500 font-mono px-1">{msg.data_note}</div>
        )}
      </div>
    </div>
  );
}

export default function AICopilot() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I'm WASTELENS AI Copilot, your food waste prevention assistant for the Bangladesh restaurant demo.\n\nI have access to your current inventory data, waste risk scores, demand forecasts, and market intelligence.\n\nAsk me anything about:\n• 🛒 What to buy or avoid buying today\n• ⚠️ Which items are at highest waste risk\n• 💰 Why specific discounts were recommended\n• 📦 Which inventory to use first (FIFO + risk)\n• 📊 Root causes of your current waste\n• 🌱 How to hit the 30% waste reduction target\n\nHow can I help?`,
      powered_by: null,
      data_note: 'SIMULATED DEMO DATA — Powered by Gemini 3.8 Flash'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [prevInteractionId, setPrevInteractionId] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text = input.trim()) {
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: 'user', text };
    const loadingMsg = { id: Date.now() + 1, role: 'assistant', text: '', loading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatCopilot(text, prevInteractionId);

      setMessages(prev =>
        prev.map(m =>
          m.id === loadingMsg.id
            ? {
                ...m,
                loading: false,
                text: res.response || 'I encountered an issue. Please try again.',
                powered_by: res.powered_by,
                data_note: res.data_note
              }
            : m
        )
      );

      if (res.interaction_id) setPrevInteractionId(res.interaction_id);
    } catch (err) {
      setMessages(prev =>
        prev.map(m =>
          m.id === loadingMsg.id
            ? { ...m, loading: false, text: `Error: ${err.message}. Please check if the backend server is running.` }
            : m
        )
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function clearConversation() {
    setMessages([{
      id: 'welcome-new',
      role: 'assistant',
      text: 'Conversation cleared. How can I help you with food waste prevention?',
      powered_by: null,
    }]);
    setPrevInteractionId(null);
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-10rem)] animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-emerald-400" />
            AI Copilot
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Conversational assistant grounded in live inventory, waste risk, and market intelligence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="demo-badge">Gemini 3.8 Flash + Fallback</span>
          <button onClick={clearConversation} className="btn-secondary flex items-center gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left: Suggested Questions */}
        <div className="hidden lg:flex flex-col w-56 flex-shrink-0 gap-2.5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Suggested Queries
          </div>
          {SUGGESTED_QUESTIONS.map(({ icon: Icon, text, color }, i) => (
            <button
              key={i}
              onClick={() => sendMessage(text)}
              disabled={loading}
              className="text-left p-3 bg-[#1a1d2e] border border-[#2a2d3e] hover:border-gray-600 rounded-xl text-xs text-gray-300 hover:text-white transition-all disabled:opacity-50 flex items-start gap-2.5"
            >
              <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${color}`} />
              {text}
            </button>
          ))}

          {/* Info box */}
          <div className="mt-auto p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl text-[11px] text-gray-400 leading-relaxed">
            <div className="text-blue-400 font-semibold mb-1">Context Awareness</div>
            Copilot has real-time access to inventory levels, expiry countdowns, demand forecasts, waste scores, and Bangladesh market intel.
          </div>
        </div>

        {/* Right: Chat Window */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#1a1d2e] border border-[#2a2d3e] rounded-2xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Mobile suggested chips */}
          <div className="lg:hidden flex gap-2 overflow-x-auto px-4 py-2 border-t border-[#2a2d3e]">
            {SUGGESTED_QUESTIONS.slice(0, 3).map(({ text }, i) => (
              <button
                key={i}
                onClick={() => sendMessage(text)}
                disabled={loading}
                className="text-xs whitespace-nowrap px-3 py-1.5 bg-[#13151f] border border-[#2a2d3e] rounded-full text-gray-300 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50"
              >
                {text}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="flex-shrink-0 p-4 border-t border-[#2a2d3e] flex gap-3 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask about inventory risk, procurement, discounts, waste causes..."
              disabled={loading}
              className="flex-1 bg-[#13151f] border border-[#2a2d3e] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 disabled:opacity-60 transition-colors"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
            >
              {loading
                ? <Loader className="w-4 h-4 text-white animate-spin" />
                : <Send className="w-4 h-4 text-white" />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
