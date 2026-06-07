import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  GameEngine,
  GameId,
  GameMode,
  PlayerSlot } from
'../../game-engine/types';
import type { TicTacToeState, TicTacToeMove, TicTacToeVariant } from '../tic-tac-toe/engine';
import { getTransport } from '../../../shared/api/socket';

interface GhostPiece {
  index: number;
  slot: PlayerSlot;
}

interface GameStoreState<TState, TMove, TMode> {
  gameId: GameId | null;
  matchId: string | null;
  mode: GameMode | null;
  variant: TMode | null;
  engine: GameEngine<TState, TMove, TMode> | null;
  gameState: TState | null;
  mySlot: PlayerSlot | null; // null for local mode
  ghostPiece: GhostPiece | null;

  initLocal: (engine: GameEngine<TState, TMove, TMode>, variant?: TMode) => void;
  initOnline: (engine: GameEngine<TState, TMove, TMode>, mySlot: PlayerSlot, variant?: TMode) => void;
  makeMove: (move: TMove) => void;
  resetGame: () => void;
}


export const useGameStore = create<GameStoreState<TicTacToeState, TicTacToeMove, TicTacToeVariant>>((set, get) => {
  const transport = getTransport();

  // Listen for remote moves
  transport.onMove((payload) => {
    const { mode: gameMode, engine, gameState } = get();
    if (gameMode === 'online' && engine && gameState) {
      const nextState = engine.applyMove(gameState, payload.move as TicTacToeMove, payload.slot);
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

    initLocal: (engine, variant) => {
      set({
        gameId: engine.id,
        matchId: nanoid(),
        mode: 'local',
        variant,
        engine,
        gameState: engine.createInitialState(variant),
        mySlot: null
      });
    },

    initOnline: (engine, mySlot, variant) => {
      set({
        gameId: engine.id,
        matchId: nanoid(),
        mode: 'online',
        variant,
        engine,
        gameState: engine.createInitialState(variant),
        mySlot
      });
    },

    makeMove: (move) => {
      const { mode, engine, gameState, mySlot, variant } = get();
      if (!engine || !gameState) return;

      const currentSlot = engine.getCurrentSlot(gameState);

      // Validation
      if (mode === 'online' && currentSlot !== mySlot) return; // Not your turn
      if (!engine.isValidMove(gameState, move, currentSlot)) return;

      // Check if we need to animate removal
      let ghost: GhostPiece | null = null;
      if (variant === 'shift' && gameState.pieceHistory[currentSlot]?.length === 3) {
        ghost = { 
          index: gameState.pieceHistory[currentSlot]![0],
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
      if (engine && variant) {
        set({
          matchId: nanoid(),
          gameState: engine.createInitialState(variant),
          ghostPiece: null
        });
      }
    }
  };
});