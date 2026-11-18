import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createEventSource } from '../services/api';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);

  const addEvent = useCallback((event) => {
    setEvents(prev => [event, ...prev].slice(0, 100)); // keep last 100 events
  }, []);

  useEffect(() => {
    let es;
    let retryTimeout;

    const connect = () => {
      es = createEventSource();

      es.onopen = () => setConnected(true);

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type !== 'heartbeat') {
            addEvent(data);
          }
        } catch {}
      };

      es.onerror = () => {
        setConnected(false);
        es.close();
        retryTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (es) es.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [addEvent]);

  return (
    <EventContext.Provider value={{ events, connected, addEvent }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  return useContext(EventContext);
}
