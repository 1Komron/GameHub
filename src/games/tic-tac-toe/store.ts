import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type {
  GameEngine,
  GameId,
  GameMode,
  PlayerSlot } from
'../../entities/game-engine/types';
import { getTransport } from '../../shared/api/socket';
import type { TicTacToeState, TicTacToeMove, TicTacToeVariant } from './engine';

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
  expiringCell: number | null;
  deletedCell: number | null;

  initLocal: (engine: GameEngine<TState, TMove, TMode>, variant?: TMode) => void;
  initOnline: (engine: GameEngine<TState, TMove, TMode>, mySlot: PlayerSlot, variant?: TMode) => void;
  makeMove: (move: TMove) => void;
  resetGame: () => void;
}


export const useGameStore = create<GameStoreState<any, TicTacToeMove, TicTacToeVariant>>((set, get) => {
  const transport = getTransport();
  let moveUnsubscribe: (() => void) | null = null;

  // Cleanup and setup listener
  const setupListener = () => {
    if (moveUnsubscribe) moveUnsubscribe();
    moveUnsubscribe = transport.onMove((payload) => {
      const { mode: gameMode, gameState: currentGameState, gameId } = get();
      if (gameMode === 'online') {
        if (gameId === 'tic-tac-toe-shift') {
          const backendState = payload.move as import('./engine').TicTacToeShiftState;
          set({ 
            gameState: backendState,
            expiringCell: backendState.expiringCell,
            deletedCell: backendState.deletedCell
          });
          return;
        }

        const backendState = payload.move as {
          board: import('./engine').Cell[];
          currentSeat: PlayerSlot;
          winnerPosition: number[] | null;
          pieceHistory: Record<PlayerSlot, number[]>;
          mode: import('./engine').TicTacToeVariant;
        };

        const nextGameState: TicTacToeState = {
          board: backendState.board,
          current: backendState.currentSeat,
          winningLine: backendState.winnerPosition ?? null,
          pieceHistory: { 0: backendState.pieceHistory?.[0] ?? [], 1: backendState.pieceHistory?.[1] ?? [] },
          mode: backendState.mode,
        };

        // Reconciliation: Only update if the backend state differs from our local optimistic state
        const isSameBoard = currentGameState?.board?.every((cell: any, i: number) => cell === nextGameState.board[i]);
        const isSameTurn = currentGameState?.current === nextGameState.current;
        const isSameWinningLine = JSON.stringify(currentGameState?.winningLine) === JSON.stringify(nextGameState.winningLine);

        if (!isSameBoard || !isSameTurn || !isSameWinningLine) {
          set({ gameState: nextGameState });
        }
      }
    });
  };

  setupListener();

  return {
    gameId: null,
    matchId: null,
    mode: null,
    variant: null,
    engine: null,
    gameState: null,
    mySlot: null,
    ghostPiece: null,
    expiringCell: null,
    deletedCell: null,

    initLocal: (engine, variant) => {
      set({
        gameId: engine.id,
        matchId: nanoid(),
        mode: 'local',
        variant,
        engine,
        gameState: engine.createInitialState(variant),
        mySlot: null,
        ghostPiece: null,
        expiringCell: null,
        deletedCell: null
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
        mySlot,
        ghostPiece: null,
        expiringCell: null,
        deletedCell: null
      });
    },

    makeMove: (move) => {
      const { mode, engine, gameState, mySlot, variant, gameId } = get();
      if (!engine || !gameState) return;

      const currentSlot = engine.getCurrentSlot(gameState);

      // Validation
      if (mode === 'online' && currentSlot !== mySlot) return; // Not your turn
      if (!engine.isValidMove(gameState, move, currentSlot)) return;

      // For online shift — skip optimistic update, backend is source of truth
      if (mode === 'online' && gameId === 'tic-tac-toe-shift') {
        transport.sendMove({ slot: currentSlot, move });
        return;
      }

      // Handle ghost piece for 'shift' mode
      let ghost: GhostPiece | null = null;
      if (gameId === 'tic-tac-toe-shift' || variant === 'shift') {
        if (gameState.pieceHistory && gameState.pieceHistory[currentSlot]?.length === 3) {
          const history = gameState.pieceHistory[currentSlot];
          if (history && history.length > 0) {
            ghost = { 
              index: history[0],
              slot: currentSlot
            };
          }
        } else if (gameId === 'tic-tac-toe-shift' && (gameState as any).expiringCell !== undefined) {
           // For online shift, use expiringCell if available
           const expiring = (gameState as any).expiringCell;
           if (expiring !== null) {
              ghost = { index: expiring, slot: currentSlot };
           }
        }
      }

      // Apply locally immediately (Optimistic Update for online mode)
      const nextState = engine.applyMove(gameState, move, currentSlot);
      set({ gameState: nextState, ghostPiece: ghost });

      if (ghost) {
        setTimeout(() => set({ ghostPiece: null }), 300);
      }

      if (mode === 'online') {
        // Concurrently send to backend
        transport.sendMove({ slot: currentSlot, move });
      }
    },

    resetGame: () => {
      const { engine, variant } = get();
      if (engine && variant) {
        set({
          matchId: nanoid(),
          gameState: engine.createInitialState(variant),
          ghostPiece: null,
          expiringCell: null,
          deletedCell: null
        });
      }
    }
  };
});