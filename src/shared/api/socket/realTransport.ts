import type { GameTransport, LocalIdentity, Unsubscribe } from './transport';
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

  private roomUpdateListeners: ((room: RoomSnapshot) => void)[] = [];
  private matchStartListeners: ((room: RoomSnapshot) => void)[] = [];
  private moveListeners: ((payload: MovePayload) => void)[] = [];
  private errorListeners: ((message: string) => void)[] = [];

  connect(_unused: LocalIdentity): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = _unused;
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

  leaveRoom(): void {
    if (this.matchId) {
      fetch(`${API_URL}/api/matches/${this.matchId}/leave`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
    }
    this.ws?.close();
    this.ws = null;
    this.matchId = null;
  }

  setReady(_unused: boolean): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = _unused;
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
    this.ws = new WebSocket(`${WS_URL}/ws/matches/${matchId}`);

    this.ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

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

        // emit move so game board updates
        if (msg.state) {
          // currentSeat in msg.state is NEXT player's turn
          // so previous player (who just moved) is the opposite
          const whoJustMoved = msg.state.currentSeat === 0 ? 1 : 0;
          this.moveListeners.forEach((l) =>
            l({
              slot: whoJustMoved,
              move: msg.state,
            })
          );
        }
      }
    };

    this.ws.onerror = () => {
      this.errorListeners.forEach((l) => l('WebSocket error'));
    };
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
