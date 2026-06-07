/**
 * Multiplayer transport configuration.
 *
 * In production this points at the future Spring Boot / Socket.IO gateway.
 * Until that server exists (and inside the preview sandbox), an in-memory
 * mock transport is used so the room / lobby flows are fully demonstrable.
 *
 * Swapping to the real backend is a one-line change: set USE_MOCK_TRANSPORT
 * to false and point SOCKET_URL at the deployed server.
 */
export const SOCKET_URL = 'https://api.example-gamehub.dev';

export const USE_MOCK_TRANSPORT = true;

/** Length of generated room codes (e.g. "ABCD123"). */
export const ROOM_CODE_LENGTH = 7;