import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  GameEngine,
  GameId,
  GameMode,
  PlayerSlot } from
'../../game-engine/types';
import { getTransport } from '../../../shared/api/socket';

interface GhostPiece {
  index: number;
  slot: PlayerSlot;
}

interface GameStoreState<TState = any, TMove = any> {
  gameId: GameId | null;
  matchId: string | null;
  mode: GameMode | null;
  variant: 'classic' | 'shift' | null;
  engine: GameEngine<TState, TMove> | null;
  gameState: TState | null;
  mySlot: PlayerSlot | null; // null for local mode
  ghostPiece: GhostPiece | null;

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
    ghostPiece: null,

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
      const { mode, engine, gameState, mySlot, variant } = get();
      if (!engine || !gameState) return;

      const currentSlot = engine.getCurrentSlot(gameState);
      const state = gameState as any;

      // Validation
      if (mode === 'online' && currentSlot !== mySlot) return; // Not your turn
      if (!engine.isValidMove(gameState, move, currentSlot)) return;

      // Check if we need to animate removal
      let ghost: GhostPiece | null = null;
      if (variant === 'shift' && state.pieceHistory[currentSlot]?.length === 3) {
        ghost = { 
          index: state.pieceHistory[currentSlot][0],
          slot: currentSlot
        };
      }

      // Apply locally immediately
      const nextState = engine.applyMove(gameState, move, currentSlot);
      set({ gameState: nextState, ghostPiece: ghost });

      if (ghost) {
        setTimeout(() => set({ ghostPiece: null }), 300);
      }

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
          gameState: engine.createInitialState(variant as any),
          ghostPiece: null
        });
      }
    }
  };
});