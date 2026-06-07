import type { GameDefinition } from '../../entities/game-engine/types';

/**
 * The game catalog. Adding a new game is as simple as appending a definition
 * here and flipping `isPlayable` once its engine + screen are implemented.
 */
export const GAME_CATALOG: GameDefinition[] = [
{
  id: 'tic-tac-toe',
  title: 'Tic Tac Toe',
  description: 'Classic 3×3 strategy. Get three in a row to win.',
  imageUrl:
  'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=800&q=80',
  accent: '#3390ec',
  supportedModes: ['local', 'online'],
  isPlayable: true
},
{
  id: 'checkers',
  title: 'Checkers',
  description: 'Capture, crown your kings, and outmaneuver your rival.',
  imageUrl:
  'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&w=800&q=80',
  accent: '#e0457b',
  supportedModes: ['local', 'online'],
  isPlayable: false
},
{
  id: 'battleship',
  title: 'Battleship',
  description: 'Place your fleet and hunt down the enemy ships.',
  imageUrl:
  'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=800&q=80',
  accent: '#2aabee',
  supportedModes: ['local', 'online'],
  isPlayable: false
},
{
  id: 'basketball',
  title: 'Basketball Throw',
  description: 'Swipe to shoot. Sink as many baskets as you can.',
  imageUrl:
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  accent: '#f5872b',
  supportedModes: ['local', 'online'],
  isPlayable: false
},
{
  id: 'bowling',
  title: 'Bowling',
  description: 'Swipe, roll, and knock down all ten pins for a strike.',
  imageUrl:
  'https://images.unsplash.com/photo-1538511058910-2bf9913b27d3?auto=format&fit=crop&w=800&q=80',
  accent: '#7c5cff',
  supportedModes: ['local', 'online'],
  isPlayable: false
}];


export const getGameById = (id: string): GameDefinition | undefined =>
GAME_CATALOG.find((g) => g.id === id);

export const PLAYABLE_GAMES = GAME_CATALOG.filter((g) => g.isPlayable);