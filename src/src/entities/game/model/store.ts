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
  variant: 'classic' | 'shift' | null;
  engine: GameEngine<TState, TMove> | null;
  gameState: TState | null;
  mySlot: PlayerSlot | null; // null for local mode

  initLocal: (engine: GameEngine<TState, TMove>, variant?: 'classic' | 'shift') => void;
  initOnline: (engine: GameEngine<TState, TMove>, mySlot: PlayerSlot, variant?: 'classic' | 'shift') => void;
  makeMove: (move: TMove) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => {
  const transport = getTransport();

  // Listen for remote moves
  transport.onMove((payload) => {
    const { mode: gameMode, engine, gameState } = get();
    if (gameMode === 'online' && engine && gameState) {
      const nextState = engine.applyMove(gameState, payload.move, payload.slot);
      set({ gameState: nextState });
    }
  });

  return {
    gameId: null,
    matchId: null,
    mode: null,
    variant: null,
    engine: null,
    gameState: null,
    mySlot: null,

    initLocal: (engine, variant = 'classic') => {
      set({
        gameId: engine.id,
        matchId: nanoid(),
        mode: 'local',
        variant,
        engine,
        gameState: engine.createInitialState(variant as any),
        mySlot: null
      });
    },

    initOnline: (engine, mySlot, variant = 'classic') => {
      set({
        gameId: engine.id,
        matchId: nanoid(),
        mode: 'online',
        variant,
        engine,
        gameState: engine.createInitialState(variant as any),
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
      const { engine, variant } = get();
      if (engine) {
        set({
          matchId: nanoid(),
          gameState: engine.createInitialState(variant as any)
        });
      }
    }
  };
});