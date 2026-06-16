import { ticTacToeEngine } from '../../games/tic-tac-toe/engine';
import type { GameEngine } from '../../entities/game-engine/types';

const ticTacToeShiftEngine = {
  ...ticTacToeEngine,
  id: 'tic-tac-toe-shift',
} as GameEngine<any, any, any>;

export const ENGINE_REGISTRY: Record<string, GameEngine<any, any, any>> = {
  'tic-tac-toe': ticTacToeEngine as GameEngine<any, any, any>,
  'tic-tac-toe-shift': ticTacToeShiftEngine,
};

export const getEngineById = <TState, TMove, TMode>(id: string): GameEngine<TState, TMove, TMode> | null =>
  (ENGINE_REGISTRY[id] as GameEngine<TState, TMove, TMode>) ?? null;
