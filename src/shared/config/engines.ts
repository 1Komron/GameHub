import { ticTacToeEngine } from '../../games/tic-tac-toe/engine';
import type { GameEngine } from '../../entities/game-engine/types';

export const ENGINE_REGISTRY: Record<string, GameEngine<unknown, unknown, unknown>> = {
  'tic-tac-toe': ticTacToeEngine as GameEngine<unknown, unknown, unknown>,
};

export const getEngineById = (id: string) => ENGINE_REGISTRY[id] ?? null;
