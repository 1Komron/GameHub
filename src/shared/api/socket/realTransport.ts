import type { GameTransport, Unsubscribe } from './transport';
import type {
  RoomSnapshot,
  MovePayload,
  RoomStatus,
} from './events';
import type { GameId } from '../../../entities/game-engine/types';
import { API_URL, WS_URL } from '../../config/socket';
import { authHeaders } from '../auth/authService';

/**
 * Production transport using native WebSockets + REST API.
 * Wire-compatible with Spring Boot backend.
 */
export class RealSocketTransport implements GameTransport {
  private ws: WebSocket | null = null;
  private matchId: string | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  private roomUpdateListeners: ((room: RoomSnapshot) => void)[] = [];
  private matchStartListeners: ((room: RoomSnapshot) => void)[] = [];
  private moveListeners: ((payload: MovePayload) => void)[] = [];
  private errorListeners: ((message: string) => void)[] = [];

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 5000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  private attemptReconnect(matchId: string) {
    if (!this.matchId) return; // User disconnected, don't reconnect
    console.log('[Socket] Attempting to reconnect in 2 seconds...');
    this.reconnectTimeout = setTimeout(() => {
      this.openWebSocket(matchId);
    }, 2000);
  }

  connect(): void {
    // Auth is handled separately via loginWithTelegram in TelegramProvider
  }

  disconnect(): void {
    this.leaveRoom();
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getMatchId(): string | null {
    return this.matchId;
  }

  async createRoom(gameId: GameId): Promise<RoomSnapshot> {
    console.log('[DIAG] Authorization Header:', authHeaders()['Authorization']);
    const response = await fetch(`${API_URL}/api/matches`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ gameCode: toGameCode(gameId) }),
    });

    if (!response.ok) throw new Error('Failed to create match');
    const result = await response.json();
    const match = result.data;
    this.matchId = match.matchId;
    this.openWebSocket(match.matchId);

    return {
      code: match.joinCode,
      gameId,
      players: [],
      status: 'waiting',
    };
  }

  async joinRoom(code: string): Promise<RoomSnapshot> {
    const response = await fetch(`${API_URL}/api/matches/join/${code}`, {
      method: 'POST',
      headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Failed to join match');
    const result = await response.json();
    const match = result.data;
    this.matchId = match.matchId;
    this.openWebSocket(match.matchId);

    return matchViewToSnapshot(match);
  }

  async joinRoomById(matchId: string): Promise<RoomSnapshot> {
    const response = await fetch(`${API_URL}/api/matches/${matchId}/join`, {
      method: 'POST',
      headers: authHeaders(),
    });

    if (!response.ok) throw new Error('Failed to join match');
    const result = await response.json();
    const match = result.data;
    this.matchId = match.matchId;
    this.openWebSocket(match.matchId);

    return matchViewToSnapshot(match);
  }

  leaveRoom(): void {
    this.matchId = null;
    this.stopHeartbeat();
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    
    // We should still try to notify the server
    fetch(`${API_URL}/api/matches/${this.matchId}/leave`, {
        method: 'DELETE',
        headers: authHeaders(),
    }).catch(() => {
        // Silent catch: Ignore network exceptions if fetch is aborted during unmount/leaving
    });

    if (this.ws) {
        this.ws.onclose = null;
        this.ws.close();
        this.ws = null;
    }
  }


  setReady(): void {
    if (!this.matchId) return;
    fetch(`${API_URL}/api/matches/${this.matchId}/ready`, {
      method: 'POST',
      headers: authHeaders(),
    });
  }

  startMatch(): void {
    if (!this.matchId) return;
    fetch(`${API_URL}/api/matches/${this.matchId}/start`, {
      method: 'POST',
      headers: authHeaders(),
    });
  }

  sendMove(payload: MovePayload): void {
    if (!this.matchId) return;
    const move = payload.move as { index: number };
    fetch(`${API_URL}/api/matches/${this.matchId}/moves`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ cell: move.index }),
    });
  }

  onRoomUpdate(cb: (room: RoomSnapshot) => void): Unsubscribe {
    this.roomUpdateListeners.push(cb);
    return () => {
      this.roomUpdateListeners = this.roomUpdateListeners.filter((l) => l !== cb);
    };
  }

  onMatchStart(cb: (room: RoomSnapshot) => void): Unsubscribe {
    this.matchStartListeners.push(cb);
    return () => {
      this.matchStartListeners = this.matchStartListeners.filter((l) => l !== cb);
    };
  }

  onMove(cb: (payload: MovePayload) => void): Unsubscribe {
    this.moveListeners.push(cb);
    return () => {
      this.moveListeners = this.moveListeners.filter((l) => l !== cb);
    };
  }

  onError(cb: (message: string) => void): Unsubscribe {
    this.errorListeners.push(cb);
    return () => {
      this.errorListeners = this.errorListeners.filter((l) => l !== cb);
    };
  }

  private openWebSocket(matchId: string) {
    if (this.ws) {
      console.log('[Socket] Closing existing WebSocket before opening new one');
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }

    // Delay for iOS WebView stability
    setTimeout(() => {
        this.ws = new WebSocket(`${WS_URL}/ws/matches/${matchId}`);

        this.ws.onopen = () => {
            console.log('[Socket] Connected');
            this.startHeartbeat();
        };

        this.ws.onclose = () => {
            console.log('[Socket] Disconnected');
            this.stopHeartbeat();
            this.attemptReconnect(matchId);
        };

        this.ws.onmessage = async (event) => {
            if (event.data === 'pong') return;
            const msg = JSON.parse(event.data);
            
            // ... (message handling logic as before)
            if (msg.type === 'PLAYER_JOINED' || msg.type === 'PLAYER_READY') {
                const match = await this.fetchMatch(matchId);
                const snapshot = matchViewToSnapshot(match);
                this.roomUpdateListeners.forEach((l) => l(snapshot));
                if (match.status === 'ACTIVE') {
                  this.matchStartListeners.forEach((cb) => cb(snapshot));
                }
              } else if (msg.type === 'MATCH_STARTED') {
                const match = await this.fetchMatch(matchId);
                const snapshot = matchViewToSnapshot(match);
                this.roomUpdateListeners.forEach(l => l(snapshot));
                this.matchStartListeners.forEach(cb => cb(snapshot));
              } else if (msg.type === 'PLAYER_LEFT') {
                const match = await this.fetchMatch(matchId);
                const snapshot = matchViewToSnapshot(match);
                this.roomUpdateListeners.forEach(l => l(snapshot));
              } else if (msg.type === 'MATCH_CANCELLED') {
                // Host left — notify remaining player
                this.errorListeners.forEach(cb => cb('Host left the room'));
                this.roomUpdateListeners.forEach(l => l({
                  code: '',
                  gameId: 'tic-tac-toe',
                  status: 'finished',
                  players: [],
                }));
              } else if (msg.type === 'MATCH_UPDATED' || msg.type === 'MATCH_FINISHED') {
                const match = await this.fetchMatch(matchId);
                const snapshot = matchViewToSnapshot(match);
                
                if (msg.type === 'MATCH_FINISHED') {
                  snapshot.status = 'finished';
                }
                
                this.roomUpdateListeners.forEach((l) => l(snapshot));
        
                if (msg.state) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const rawBoard = (msg.state.board as any[]) || [];
                  
                  // Detect shift mode: board items are objects, not strings
                  const isShift = rawBoard.some(c => c !== null && typeof c === 'object');
                  
                  const normalizedBoard = isShift
                    ? rawBoard // shift: pass as-is, objects with {seat, cell, moveNumber}
                    : rawBoard.map((c) => { // classic: normalize 'X'->0, 'O'->1
                        if (c === 'X') return 0;
                        if (c === 'O') return 1;
                        return null;
                      });
        
                  const whoJustMoved = msg.state.currentSeat === 0 ? 1 : 0;
                  this.moveListeners.forEach((l) =>
                    l({
                      slot: whoJustMoved,
                      move: {
                        ...msg.state,
                        board: normalizedBoard,
                      },
                    })
                  );
                }
              }
        };

        this.ws.onerror = () => {
            this.errorListeners.forEach((l) => l('WebSocket error'));
        };
    }, 500);
  }


  private async fetchMatch(matchId: string) {
    const response = await fetch(`${API_URL}/api/matches/${matchId}`, {
      headers: authHeaders(),
    });
    const result = await response.json();
    console.log('fetchMatch result:', result); // добавь это
    return result.data;
  }
}

function toGameCode(gameId: GameId): string {
  return gameId.toUpperCase().replace(/-/g, '_');
}

function toRoomStatus(status: string): RoomStatus {
  if (status === 'ACTIVE') return 'in-progress';
  if (status === 'FINISHED') return 'finished';
  return 'waiting';
}

function toGameId(gameCode: string): GameId {
  return gameCode.toLowerCase().replace(/_/g, '-') as GameId;
}

function matchViewToSnapshot(match: {
  joinCode?: string;
  gameCode: string;
  status: string;
  players?: { userId: number; seat: number; isReady?: boolean }[];
}): RoomSnapshot {
  console.log('matchViewToSnapshot input:', match);
  return {
    code: match.joinCode ?? '',
    gameId: toGameId(match.gameCode),
    status: toRoomStatus(match.status),
    players: (match.players ?? []).map((p) => ({
      id: String(p.userId),
      name: String(p.userId),
      slot: (p.seat === 0 ? 0 : 1) as import('../../../entities/game-engine/types').PlayerSlot,
      ready: p.isReady ?? false,
      isHost: p.seat === 0,
    })),
  };
}
