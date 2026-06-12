export const API_URL = import.meta.env.VITE_API_URL ?? 'https://game-hub-back.duckdns.org';
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'wss://game-hub-back.duckdns.org';

export const USE_MOCK_TRANSPORT = false;

/** Length of generated room codes (e.g. "ABCD123"). */
export const ROOM_CODE_LENGTH = 7;
