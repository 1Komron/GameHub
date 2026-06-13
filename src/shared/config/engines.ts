import { ticTacToeEngine } from '../../games/tic-tac-toe/engine';
import type { GameEngine } from '../../entities/game-engine/types';

export const ENGINE_REGISTRY: Record<string, GameEngine<any, any, any>> = {
  'tic-tac-toe': ticTacToeEngine,
};

export const getEngineById = <TState, TMove, TMode>(id: string): GameEngine<TState, TMove, TMode> | null => 
  (ENGINE_REGISTRY[id] as GameEngine<TState, TMove, TMode>) ?? null;
