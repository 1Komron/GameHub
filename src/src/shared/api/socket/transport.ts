import type { RoomSnapshot, MovePayload } from './events';
import type { GameId } from '../../../entities/game-engine/types';

export type Unsubscribe = () => void;

export interface LocalIdentity {
  id: string;
  name: string;
  photoUrl?: string;
}

/**
 * Transport abstraction decoupling the app from the concrete network layer.
 * `RealSocketTransport` (socket.io-client) and `MockTransport` (in-memory)
 * both implement this, so swapping backends never touches app/store code.
 */
export interface GameTransport {
  connect: (identity: LocalIdentity) => void;
  disconnect: () => void;
  isConnected: () => boolean;

  createRoom: (gameId: GameId) => Promise<RoomSnapshot>;
  joinRoom: (code: string) => Promise<RoomSnapshot>;
  leaveRoom: () => void;
  setReady: (ready: boolean) => void;
  startMatch: () => void;
  sendMove: (payload: MovePayload) => void;

  onRoomUpdate: (cb: (room: RoomSnapshot) => void) => Unsubscribe;
  onMatchStart: (cb: (room: RoomSnapshot) => void) => Unsubscribe;
  onMove: (cb: (payload: MovePayload) => void) => Unsubscribe;
  onError: (cb: (message: string) => void) => Unsubscribe;
}