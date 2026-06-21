import { API_URL } from '../config/socket';

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let currentToken: string | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener = (event: any) => void;
const listeners = new Set<Listener>();

export const onPresenceMessage = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getWsUrl = (baseUrl: string): string => {
  return baseUrl.replace(/^http/, 'ws');
};

export const initPresenceSocket = (token: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log('[Presence] Already connected');
    return;
  }

  currentToken = token;
  const wsBaseUrl = getWsUrl(API_URL);
  const url = `${wsBaseUrl}/ws/presence?token=${token}`;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  console.log('[Presence] Connecting to', url);
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('[Presence] Connected');
  };

  socket.onmessage = (event) => {
    // Standard heartbeat or presence events can be handled here if needed
    if (event.data === 'ping') {
        socket?.send('pong');
        return;
    }

    try {
        const data = JSON.parse(event.data);
        listeners.forEach((listener) => listener(data));
    } catch (e) {
        console.warn('[Presence] Failed to parse message', event.data, e);
    }
  };

  socket.onclose = (event) => {
    console.log('[Presence] Disconnected', event.reason);
    socket = null;
    
    // Reconnect after 5 seconds if we still have a token
    if (currentToken) {
        console.log('[Presence] Reconnecting in 5 seconds...');
        reconnectTimer = setTimeout(() => {
            initPresenceSocket(currentToken!);
        }, 5000);
    }
  };

  socket.onerror = (error) => {
    console.error('[Presence] WebSocket error', error);
  };
};

export const disconnectPresenceSocket = () => {
    currentToken = null;
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
    if (socket) {
        socket.onclose = null;
        socket.close();
        socket = null;
    }
};
