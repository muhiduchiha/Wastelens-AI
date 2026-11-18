import { useEvents } from '../context/EventContext';

const severity = {
  info: 'text-blue-400',
  warning: 'text-amber-400',
  danger: 'text-red-400',
  success: 'text-emerald-400',
};

const typeIcon = {
  pos_sale: '🛒',
  inventory_update: '📦',
  expiry_alert: '⏰',
  market_update: '📈',
  ai_recommendation: '🤖',
  connected: '🟢',
  heartbeat: '💓',
};

export default function LiveEventFeed({ maxItems = 10 }) {
  const { events, connected } = useEvents();
  const visible = events.slice(0, maxItems);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
        <span className="text-xs text-gray-400">{connected ? 'Connected' : 'Reconnecting...'}</span>
        <span className="text-[10px] text-gray-600 ml-auto font-mono">Demo / Simulated</span>
      </div>

      {visible.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-6">
          Waiting for events...
        </div>
      )}

      <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
        {visible.map((e, i) => (
          <div key={e.id || i} className={`flex items-start gap-2 text-xs p-2 rounded-lg bg-white/3 ${i === 0 ? 'animate-slide-in' : ''}`}>
            <span className="flex-shrink-0 mt-0.5">{typeIcon[e.type] || '📡'}</span>
            <div className="flex-1 min-w-0">
              <div className={`${severity[e.severity] || 'text-gray-300'} leading-snug`}>{e.message}</div>
              <div className="text-gray-600 text-[10px] mt-0.5 font-mono">
                {e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
