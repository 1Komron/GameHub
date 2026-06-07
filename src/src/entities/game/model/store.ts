import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  GameEngine,
  GameId,
  GameMode,
  PlayerSlot } from
'../../game-engine/types';
import { getTransport } from '../../../shared/api/socket';

interface GameStoreState<TState = any, TMove = any> {
  gameId: GameId | null;
  matchId: string | null;
  mode: GameMode | null;
  engine: GameEngine<TState, TMove> | null;
  gameState: TState | null;
  mySlot: PlayerSlot | null; // null for local mode

  initLocal: (engine: GameEngine<TState, TMove>) => void;
  initOnline: (engine: GameEngine<TState, TMove>, mySlot: PlayerSlot) => void;
  makeMove: (move: TMove) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => {
  const transport = getTransport();

  // Listen for remote moves
  transport.onMove((payload) => {
    const { mode, engine, gameState } = get();
    if (mode === 'online' && engine && gameState) {
      const nextState = engine.applyMove(gameState, payload.move, payload.slot);
      set({ gameState: nextState });
    }
  });

  return {
    gameId: null,
    matchId: null,
    mode: null,
    engine: null,
    gameState: null,
    mySlot: null,

    initLocal: (engine) => {
      set({
        gameId: engine.id,
        matchId: nanoid(),
        mode: 'local',
        engine,
        gameState: engine.createInitialState(),
        mySlot: null
      });
    },

    initOnline: (engine, mySlot) => {
      set({
        gameId: engine.id,
        matchId: nanoid(),
        mode: 'online',
        engine,
        gameState: engine.createInitialState(),
        mySlot
      });
    },

    makeMove: (move) => {
      const { mode, engine, gameState, mySlot } = get();
      if (!engine || !gameState) return;

      const currentSlot = engine.getCurrentSlot(gameState);

      // Validation
      if (mode === 'online' && currentSlot !== mySlot) return; // Not your turn
      if (!engine.isValidMove(gameState, move, currentSlot)) return;

      // Apply locally
      const nextState = engine.applyMove(gameState, move, currentSlot);
      set({ gameState: nextState });

      // Broadcast if online
      if (mode === 'online') {
        transport.sendMove({ slot: currentSlot, move });
      }
    },

    resetGame: () => {
      const { engine } = get();
      if (engine) {
        set({
          matchId: nanoid(),
          gameState: engine.createInitialState()
        });
      }
    }
  };
});