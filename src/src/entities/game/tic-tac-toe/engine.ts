import type {
  GameEngine,
  MatchStatus,
  PlayerSlot } from
'../../game-engine/types';
import { WINNING_COMBINATIONS } from '../../../shared/constants/game';

export type Cell = PlayerSlot | null;

export interface TicTacToeState {
  board: Cell[];
  current: PlayerSlot;
  winningLine: number[] | null;
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

export const ticTacToeEngine: GameEngine<TicTacToeState, TicTacToeMove> = {
  id: 'tic-tac-toe',

  createInitialState: (): TicTacToeState => ({
    board: Array<Cell>(9).fill(null),
    current: 0,
    winningLine: null
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
    board[move.index] = slot;
    const winningLine = findWinningLine(board);
    return {
      board,
      current: (slot === 0 ? 1 : 0) as PlayerSlot,
      winningLine
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