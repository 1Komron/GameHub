import type {
  GameEngine,
  MatchStatus,
  PlayerSlot } from
'../../entities/game-engine/types';
import { WINNING_COMBINATIONS } from '../../shared/constants/game';

export type Cell = PlayerSlot | null;

export type TicTacToeVariant = 'classic' | 'shift';

export interface TicTacToeState {
  board: Cell[];
  current: PlayerSlot;
  winningLine: number[] | null;
  pieceHistory: Record<PlayerSlot, number[]>;
  mode?: TicTacToeVariant;
}

export type TicTacToeMove = {index: number;};

/** Maps a slot to its display mark. */
export const SLOT_MARK: Record<PlayerSlot, 'X' | 'O'> = { 0: 'X', 1: 'O' };

const findWinningLine = (board: Cell[]): number[] | null => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
      return combo;
    }
  }
  return null;
};

export const ticTacToeEngine: GameEngine<TicTacToeState, TicTacToeMove, TicTacToeVariant> = {
  id: 'tic-tac-toe',

  createInitialState: (mode: TicTacToeVariant = 'classic'): TicTacToeState => ({
    board: Array<Cell>(9).fill(null),
    current: 0,
    winningLine: null,
    pieceHistory: { 0: [], 1: [] },
    mode
  }),

  isValidMove: (state, move, slot): boolean => {
    if (ticTacToeEngine.getStatus(state) !== 'playing') {
      // Allow the very first move when status is idle.
      if (ticTacToeEngine.getStatus(state) !== 'idle') return false;
    }
    if (state.current !== slot) return false;
    return state.board[move.index] === null;
  },

  applyMove: (state, move, slot): TicTacToeState => {
    if (!ticTacToeEngine.isValidMove(state, move, slot)) return state;
    const board = [...state.board];
    const pieceHistory = { ...state.pieceHistory, [slot]: [...state.pieceHistory[slot]] };
    
    board[move.index] = slot;
    pieceHistory[slot].push(move.index);
    
    // Enforce piece limit in shift mode
    if (state.mode === 'shift' && pieceHistory[slot].length > 3) {
      const oldestIndex = pieceHistory[slot].shift();
      if (oldestIndex !== undefined) {
        board[oldestIndex] = null;
      }
    }
    
    const winningLine = findWinningLine(board);
    return {
      ...state,
      board,
      current: (slot === 0 ? 1 : 0) as PlayerSlot,
      winningLine,
      pieceHistory
    };
  },

  getStatus: (state): MatchStatus => {
    if (state.winningLine) return 'won';
    if (state.board.some((c) => c === null)) {
      return state.board.every((c) => c === null) ? 'idle' : 'playing';
    }
    return 'draw';
  },

  getWinner: (state): PlayerSlot | null => {
    if (!state.winningLine) return null;
    return state.board[state.winningLine[0]] as PlayerSlot;
  },

  getCurrentSlot: (state): PlayerSlot => state.current
};