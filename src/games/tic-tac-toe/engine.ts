import type {
  GameEngine,
  MatchStatus,
  PlayerSlot } from
'../../entities/game-engine/types';
import { WINNING_COMBINATIONS } from '../../shared/constants/game';

export type Cell = PlayerSlot | null;

export type TicTacToeVariant = 'classic' | 'shift';

export interface ShiftMove {
  seat: number;
  cell: number;
  moveNumber: number;
}

export interface TicTacToeShiftState {
  board: (ShiftMove | null)[];
  currentSeat: number;
  winnerSeat: number | null;
  winnerPosition: number[] | null;
  draw: boolean;
  expiringCell: number | null;
  deletedCell: number | null;
  totalMoves: number;
}

export function applyShiftMove(state: TicTacToeShiftState, move: TicTacToeMove, slot: number): TicTacToeShiftState {
  const board = [...state.board];
  const totalMoves = state.totalMoves + 1;
  
  // Place new move
  board[move.index] = { seat: slot, cell: move.index, moveNumber: totalMoves };
  
  let deletedCell: number | null = null;
  // Evict oldest move of current player if they have 4+ moves (i.e. totalMoves > 6 globally for this seat)
  if (totalMoves > 6) {
    const ownMoves = board
      .filter((m): m is ShiftMove => m !== null && m.seat === slot)
      .sort((a, b) => a.moveNumber - b.moveNumber);
    
    if (ownMoves.length > 3) {
      const oldest = ownMoves[0];
      deletedCell = oldest.cell;
      board[oldest.cell] = null;
    }
  }
  
  const nextSeat = slot === 0 ? 1 : 0;
  
  // Compute expiring cell for the NEXT seat (the one about to move)
  let expiringCell: number | null = null;
  if (totalMoves >= 6) {
    const nextSeatMoves = board
      .filter((m): m is ShiftMove => m !== null && m.seat === nextSeat)
      .sort((a, b) => a.moveNumber - b.moveNumber);
    if (nextSeatMoves.length === 3) {
      expiringCell = nextSeatMoves[0].cell;
    }
  }
  
  return {
    ...state,
    board,
    currentSeat: nextSeat,
    deletedCell,
    expiringCell,
    totalMoves,
  };
}

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isValidMove: (state: any, move, slot): boolean => {
    if (ticTacToeEngine.getStatus(state) !== 'playing') {
      // Allow the very first move when status is idle.
      if (ticTacToeEngine.getStatus(state) !== 'idle') return false;
    }
    
    // Support both classic (state.current) and shift (state.currentSeat)
    const currentTurn = state.current !== undefined ? state.current : state.currentSeat;
    if (currentTurn !== slot) return false;
    
    // Support both classic (string/number cell) and shift (object cell)
    const cell = state.board[move.index];
    return cell === null;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getStatus: (state: any): MatchStatus => {
    if (state.winnerSeat !== undefined) {
      if (state.winnerSeat !== null) return 'won';
      if (state.draw) return 'draw';
      return state.totalMoves === 0 ? 'idle' : 'playing';
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (state.winningLine) return 'won';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (state.board.some((c: any) => c === null)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return state.board.every((c: any) => c === null) ? 'idle' : 'playing';
    }
    return 'draw';
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getWinner: (state: any): PlayerSlot | null => {
    if (state.winnerSeat !== undefined) return state.winnerSeat as PlayerSlot;
    if (!state.winningLine) return null;
    return state.board[state.winningLine[0]] as PlayerSlot;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCurrentSlot: (state: any): PlayerSlot => {
    if (state.currentSeat !== undefined) return state.currentSeat as PlayerSlot;
    return state.current;
  }
};