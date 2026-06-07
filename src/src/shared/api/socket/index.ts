import type { GameTransport } from './transport';
import { MockTransport } from './mockTransport';
import { RealSocketTransport } from './realTransport';
import { USE_MOCK_TRANSPORT } from '../../config/socket';

let instance: GameTransport | null = null;

/**
 * Returns the singleton transport. Picks Mock or Real based on config so the
 * rest of the app is agnostic to which network layer is active.
 */
export const getTransport = (): GameTransport => {
  if (!instance) {
    instance = USE_MOCK_TRANSPORT ?
    new MockTransport() :
    new RealSocketTransport();
  }
  return instance;
};

export type { GameTransport } from './transport';
export type {
  RoomSnapshot,
  RoomPlayer,
  RoomStatus,
  MovePayload } from
'./events';