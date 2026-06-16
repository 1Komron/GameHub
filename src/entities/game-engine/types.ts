/**
 * Core game-engine contracts shared by every game in the hub.
 *
 * Any new game implements `GameEngine<TState, TMove>` and registers a
 * `GameDefinition` in the catalog. The platform (catalog, routing, lobby,
 * multiplayer transport, stats) is entirely game-agnostic and depends only
 * on these interfaces — adding a game never requires changing the platform.
 */

export type GameId =
'tic-tac-toe' |
'tic-tac-toe-shift' |
'checkers' |
'battleship' |
'basketball' |
'bowling';

export type GameMode = 'local' | 'online';

export type MatchStatus = 'idle' | 'playing' | 'won' | 'draw';

/** A seat in a match. Local games map both seats to one device. */
export type PlayerSlot = 0 | 1;

/** Outcome reported to the statistics layer, relative to the local player. */
export type MatchResult = 'win' | 'loss' | 'draw' | 'none';

/**
 * The reusable per-game engine. Pure and serializable: state is plain data so
 * it can be synchronized over the wire for online play.
 */
export interface GameEngine<TState, TMove, TMode = string> {
  readonly id: GameId;
  /** Fresh initial state for a new match. */
  createInitialState: (mode?: TMode) => TState;
  /** Validate + apply a move, returning the next state. Never mutates input. */
  applyMove: (state: TState, move: TMove, slot: PlayerSlot) => TState;
  /** Whether a move is currently legal for the given slot. */
  isValidMove: (state: TState, move: TMove, slot: PlayerSlot) => boolean;
  /** Match status derived purely from state. */
  getStatus: (state: TState) => MatchStatus;
  /** Winning slot if the match is won, else null. */
  getWinner: (state: TState) => PlayerSlot | null;
  /** Whose turn it is. */
  getCurrentSlot: (state: TState) => PlayerSlot;
}

/** Catalog metadata describing a game card on the home screen. */
export interface GameDefinition {
  id: GameId;
  title: string;
  description: string;
  imageUrl: string;
  /** Tailwind-friendly accent (hex) used for the card. */
  accent: string;
  supportedModes: GameMode[];
  /** False renders a "Coming Soon" card with a disabled Play button. */
  isPlayable: boolean;
}