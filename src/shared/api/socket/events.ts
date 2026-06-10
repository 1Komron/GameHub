import type { GameId, PlayerSlot } from '../../../entities/game-engine/types';

/** A participant in a room. */
export interface RoomPlayer {
  id: string;
  name: string;
  photoUrl?: string;
  slot: PlayerSlot;
  ready: boolean;
  isHost: boolean;
}

export type RoomStatus = 'waiting' | 'in-progress' | 'finished';

/** Serializable room snapshot broadcast to all members. */
export interface RoomSnapshot {
  code: string;
  gameId: GameId;
  players: RoomPlayer[];
  status: RoomStatus;
}

/** A move on the wire — game state is game-specific, hence `unknown`. */
export interface MovePayload<TMove = unknown> {
  slot: PlayerSlot;
  move: TMove;
}

/** Events the client emits to the server. */
export interface ClientToServerEvents {
  'room:create': (gameId: GameId, ack: (room: RoomSnapshot) => void) => void;
  'room:join': (
  code: string,
  ack: (result: RoomSnapshot | {error: string;}) => void)
  => void;
  'room:leave': () => void;
  'room:ready': (ready: boolean) => void;
  'room:start': () => void;
  'game:move': (payload: MovePayload) => void;
}

/** Events the server emits to clients. */
export interface ServerToClientEvents {
  'room:update': (room: RoomSnapshot) => void;
  'room:start': (room: RoomSnapshot) => void;
  'game:move': (payload: MovePayload) => void;
  'room:error': (message: string) => void;
}