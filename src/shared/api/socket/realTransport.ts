import { io, type Socket } from 'socket.io-client';
import type { GameTransport, LocalIdentity, Unsubscribe } from './transport';
import type {
  RoomSnapshot,
  MovePayload,
  ClientToServerEvents,
  ServerToClientEvents } from
'./events';
import type { GameId } from '../../../entities/game-engine/types';
import { SOCKET_URL } from '../../config/socket';

/**
 * Production transport backed by socket.io-client. Wire-compatible with a
 * Spring Boot / Socket.IO gateway implementing the event contracts in
 * events.ts. Selected automatically when USE_MOCK_TRANSPORT is false.
 */
export class RealSocketTransport implements GameTransport {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
  null;

  connect(identity: LocalIdentity): void {
    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket'],
      auth: identity
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  createRoom(gameId: GameId): Promise<RoomSnapshot> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Not connected'));
      this.socket.emit('room:create', gameId, (room) => resolve(room));
    });
  }

  joinRoom(code: string): Promise<RoomSnapshot> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Not connected'));
      this.socket.emit('room:join', code, (result) => {
        if ('error' in result) reject(new Error(result.error));else
        resolve(result);
      });
    });
  }

  leaveRoom(): void {
    this.socket?.emit('room:leave');
  }

  setReady(ready: boolean): void {
    this.socket?.emit('room:ready', ready);
  }

  startMatch(): void {
    this.socket?.emit('room:start');
  }

  sendMove(payload: MovePayload): void {
    this.socket?.emit('game:move', payload);
  }

  onRoomUpdate(cb: (room: RoomSnapshot) => void): Unsubscribe {
    this.socket?.on('room:update', cb);
    return () => this.socket?.off('room:update', cb);
  }

  onMatchStart(cb: (room: RoomSnapshot) => void): Unsubscribe {
    this.socket?.on('room:start', cb);
    return () => this.socket?.off('room:start', cb);
  }

  onMove(cb: (payload: MovePayload) => void): Unsubscribe {
    this.socket?.on('game:move', cb);
    return () => this.socket?.off('game:move', cb);
  }

  onError(cb: (message: string) => void): Unsubscribe {
    this.socket?.on('room:error', cb);
    return () => this.socket?.off('room:error', cb);
  }
}