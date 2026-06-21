import { create } from 'zustand';
import { getTransport, type RoomSnapshot } from '../../../shared/api/socket';
import type { GameId, PlayerSlot } from '../../game-engine/types';
import type { LocalIdentity } from '../../../shared/api/socket/transport';
import { useUserStore } from '../../user/model/store';

interface RoomState {
  matchId: string | null;
  room: RoomSnapshot | null;
  mySlot: PlayerSlot | null;
  error: string | null;
  isConnecting: boolean;
  isCreator: boolean;

  connect: (identity: LocalIdentity) => void;
  createRoom: (gameId: GameId) => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  joinRoomById: (matchId: string) => Promise<void>;
  setReady: (ready: boolean) => void;
  startMatch: () => void;
  leaveRoom: () => void;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set) => {
  const transport = getTransport();

  const updateRoomState = (snapshot: RoomSnapshot) => {
    const currentUserId = String(useUserStore.getState().user?.id);
    const myPlayer = snapshot.players.find((p) => p.id === currentUserId);
    set({ room: snapshot, mySlot: myPlayer?.slot ?? null });
  };

  // Setup listeners once
  transport.onRoomUpdate(updateRoomState);
  transport.onMatchStart(updateRoomState);

  transport.onError((error) => {
    set({ error, isConnecting: false });
  });

  return {
    matchId: null,
    room: null,
    mySlot: null,
    error: null,
    isConnecting: false,
    isCreator: false,

    connect: (identity: LocalIdentity) => {
      if (!transport.isConnected()) {
        transport.connect(identity);
      }
    },

    createRoom: async (gameId: GameId) => {
      set({ isConnecting: true, error: null });
      try {
        const room = await transport.createRoom(gameId);
        const matchId = transport.getMatchId();
        const currentUserId = String(useUserStore.getState().user?.id);
        const myPlayer = room.players.find((p) => p.id === currentUserId);
        set({ room, mySlot: myPlayer?.slot ?? 0, isConnecting: false, matchId, isCreator: true });
      } catch (err: unknown) {
        set({
          error: err instanceof Error ? err.message : 'Failed to create room',
          isConnecting: false
        });
      }
    },

    joinRoom: async (code: string) => {
      set({ isConnecting: true, error: null });
      try {
        const room = await transport.joinRoom(code);
        const matchId = transport.getMatchId();
        const currentUserId = String(useUserStore.getState().user?.id);
        const myPlayer = room.players.find((p) => p.id === currentUserId);
        set({ room, mySlot: myPlayer?.slot ?? null, isConnecting: false, matchId, isCreator: false });
      } catch (err: unknown) {
        set({
          error: err instanceof Error ? err.message : 'Failed to join room',
          isConnecting: false
        });
      }
    },

    joinRoomById: async (matchId: string) => {
      set({ isConnecting: true, error: null });
      try {
        const room = await transport.joinRoomById(matchId);
        const currentUserId = String(useUserStore.getState().user?.id);
        const myPlayer = room.players.find((p) => p.id === currentUserId);
        set({ room, mySlot: myPlayer?.slot ?? null, isConnecting: false, matchId, isCreator: false });
      } catch (err: unknown) {
        set({
          error: err instanceof Error ? err.message : 'Failed to join match',
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
      set({ room: null, mySlot: null, matchId: null, isCreator: false, error: null });
    },

    clearError: () => set({ error: null })
  };
});