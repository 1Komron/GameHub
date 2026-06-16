import { ticTacToeEngine } from '../../games/tic-tac-toe/engine';
import type { GameEngine } from '../../entities/game-engine/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ticTacToeShiftEngine = {
  ...ticTacToeEngine,
  id: 'tic-tac-toe-shift',
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as GameEngine<any, any, any>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ENGINE_REGISTRY: Record<string, GameEngine<any, any, any>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'tic-tac-toe': ticTacToeEngine as GameEngine<any, any, any>,
  'tic-tac-toe-shift': ticTacToeShiftEngine,
};

export const getEngineById = <TState, TMove, TMode>(id: string): GameEngine<TState, TMove, TMode> | null =>
  (ENGINE_REGISTRY[id] as GameEngine<TState, TMove, TMode>) ?? null;
