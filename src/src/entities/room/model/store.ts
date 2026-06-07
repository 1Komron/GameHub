import { create } from 'zustand';
import { getTransport, type RoomSnapshot } from '../../../shared/api/socket';
import type { GameId, PlayerSlot } from '../../game-engine/types';
import type { LocalIdentity } from '../../../shared/api/socket/transport';

interface RoomState {
  room: RoomSnapshot | null;
  mySlot: PlayerSlot | null;
  error: string | null;
  isConnecting: boolean;

  connect: (identity: LocalIdentity) => void;
  createRoom: (gameId: GameId) => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  setReady: (ready: boolean) => void;
  startMatch: () => void;
  leaveRoom: () => void;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set) => {
  const transport = getTransport();

  // Setup listeners once
  transport.onRoomUpdate((room) => {
    set({ room });
  });

  transport.onError((error) => {
    set({ error, isConnecting: false });
  });

  return {
    room: null,
    mySlot: null,
    error: null,
    isConnecting: false,

    connect: (identity: LocalIdentity) => {
      if (!transport.isConnected()) {
        transport.connect(identity);
      }
    },

    createRoom: async (gameId: GameId) => {
      set({ isConnecting: true, error: null });
      try {
        const room = await transport.createRoom(gameId);
        set({ room, mySlot: 0, isConnecting: false }); // Creator is always slot 0 (Host)
      } catch (err: any) {
        set({
          error: err.message || 'Failed to create room',
          isConnecting: false
        });
      }
    },

    joinRoom: async (code: string) => {
      set({ isConnecting: true, error: null });
      try {
        const room = await transport.joinRoom(code);
        // Assuming the second player to join gets slot 1. In a real app, the server assigns this and returns it.
        // For our mock, the host is 0, guest is 1.
        const myPlayer = room.players.find((p) => !p.isHost);
        set({ room, mySlot: myPlayer?.slot ?? 1, isConnecting: false });
      } catch (err: any) {
        set({
          error: err.message || 'Failed to join room',
          isConnecting: false
        });
      }
    },

    setReady: (ready: boolean) => {
      transport.setReady(ready);
    },

    startMatch: () => {
      transport.startMatch();
    },

    leaveRoom: () => {
      transport.leaveRoom();
      set({ room: null, mySlot: null });
    },

    clearError: () => set({ error: null })
  };
});