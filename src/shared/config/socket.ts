/**
 * Multiplayer transport configuration.
 *
 * In production this points at the future Spring Boot / Socket.IO gateway.
 */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080';

export const USE_MOCK_TRANSPORT = false;

/** Length of generated room codes (e.g. "ABCD123"). */
export const ROOM_CODE_LENGTH = 7;
