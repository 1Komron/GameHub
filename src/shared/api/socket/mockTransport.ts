import { nanoid } from 'nanoid';
import type { GameTransport, LocalIdentity, Unsubscribe } from './transport';
import type { RoomSnapshot, RoomPlayer, MovePayload } from './events';
import type { GameId } from '../../../entities/game-engine/types';
import { ROOM_CODE_LENGTH } from '../../config/socket';

type Listener<T> = (payload: T) => void;

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const makeCode = (): string =>
Array.from(
  { length: ROOM_CODE_LENGTH },
  () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
).join('');

/**
 * In-memory transport used in the preview sandbox and until the real backend
 * exists. It simulates a remote opponent: after the host creates a room a
 * bot player joins, mirrors the ready state, and echoes the lobby/start flow
 * so every online screen is demonstrable on a single device.
 *
 * This is a development transport, not a stub — it fully implements the
 * GameTransport contract so swapping in RealSocketTransport is seamless.
 */
export class MockTransport implements GameTransport {
  private identity: LocalIdentity | null = null;
  private room: RoomSnapshot | null = null;
  private connected = false;

  private roomUpdateListeners = new Set<Listener<RoomSnapshot>>();
  private matchStartListeners = new Set<Listener<RoomSnapshot>>();
  private moveListeners = new Set<Listener<MovePayload>>();
  private errorListeners = new Set<Listener<string>>();

  connect(identity: LocalIdentity): void {
    this.identity = identity;
    this.connected = true;
  }

  disconnect(): void {
    this.connected = false;
    this.room = null;
  }

  isConnected(): boolean {
    return this.connected;
  }

  private emitRoom(): void {
    if (this.room) {
      const snapshot = structuredClone(this.room);
      this.roomUpdateListeners.forEach((cb) => cb(snapshot));
    }
  }

  private hostPlayer(): RoomPlayer {
    const id = this.identity?.id ?? nanoid();
    return {
      id,
      name: this.identity?.name ?? 'You',
      photoUrl: this.identity?.photoUrl,
      slot: 0,
      ready: false,
      isHost: true
    };
  }

  private spawnOpponent(): void {
    if (!this.room || this.room.players.length > 1) return;
    this.room.players.push({
      id: nanoid(),
      name: 'Guest Player',
      slot: 1,
      ready: false,
      isHost: false
    });
    this.emitRoom();

    // Simulated opponent readies up shortly after joining.
    setTimeout(() => {
      if (!this.room) return;
      const opp = this.room.players.find((p) => p.slot === 1);
      if (opp) opp.ready = true;
      this.emitRoom();
    }, 1200);
  }

  createRoom(gameId: GameId): Promise<RoomSnapshot> {
    this.room = {
      code: makeCode(),
      gameId,
      players: [this.hostPlayer()],
      status: 'waiting'
    };
    const snapshot = structuredClone(this.room);
    // Opponent joins a beat later to mimic a friend opening the invite link.
    setTimeout(() => this.spawnOpponent(), 1500);
    return Promise.resolve(snapshot);
  }

  joinRoom(code: string): Promise<RoomSnapshot> {
    // In mock mode we synthesize a room for any code so invite links work.
    this.room = {
      code: code.toUpperCase(),
      gameId: 'tic-tac-toe',
      players: [
      {
        id: nanoid(),
        name: 'Host Player',
        slot: 0,
        ready: true,
        isHost: true
      },
      { ...this.hostPlayer(), slot: 1, isHost: false }],

      status: 'waiting'
    };
    return Promise.resolve(structuredClone(this.room));
  }

  leaveRoom(): void {
    this.room = null;
  }

  setReady(ready: boolean): void {
    if (!this.room) return;
    const me = this.room.players.find((p) => p.isHost) ?? this.room.players[0];
    if (me) me.ready = ready;
    this.emitRoom();
  }

  startMatch(): void {
    if (!this.room) return;
    this.room.status = 'in-progress';
    const snapshot = structuredClone(this.room);
    this.matchStartListeners.forEach((cb) => cb(snapshot));
  }

  sendMove(payload: MovePayload): void {
    // Echo back so the originating client confirms its own move, mirroring
    // server round-trip behavior.
    this.moveListeners.forEach((cb) => cb(payload));
  }

  onRoomUpdate(cb: Listener<RoomSnapshot>): Unsubscribe {
    this.roomUpdateListeners.add(cb);
    return () => this.roomUpdateListeners.delete(cb);
  }

  onMatchStart(cb: Listener<RoomSnapshot>): Unsubscribe {
    this.matchStartListeners.add(cb);
    return () => this.matchStartListeners.delete(cb);
  }

  onMove(cb: Listener<MovePayload>): Unsubscribe {
    this.moveListeners.add(cb);
    return () => this.moveListeners.delete(cb);
  }

  onError(cb: Listener<string>): Unsubscribe {
    this.errorListeners.add(cb);
    return () => this.errorListeners.delete(cb);
  }
}