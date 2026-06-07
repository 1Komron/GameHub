import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameId, MatchResult } from '../../game-engine/types';

interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  played: number;
}

interface StatisticsState {
  games: Record<GameId, GameStats>;
  totalGames: number;
  favoriteGame: GameId | null;

  recordResult: (gameId: GameId, result: MatchResult) => void;
  resetStats: () => void;
}

const initialGameStats: GameStats = { wins: 0, losses: 0, draws: 0, played: 0 };

export const useStatisticsStore = create<StatisticsState>()(
  persist(
    (set) => ({
      games: {} as Record<GameId, GameStats>,
      totalGames: 0,
      favoriteGame: null,

      recordResult: (gameId, result) =>
      set((state) => {
        const currentStats = state.games[gameId] || { ...initialGameStats };
        const newStats = { ...currentStats, played: currentStats.played + 1 };

        if (result === 'win') newStats.wins++;else
        if (result === 'loss') newStats.losses++;else
        if (result === 'draw') newStats.draws++;

        const newGames = { ...state.games, [gameId]: newStats };

        // Calculate favorite game (most played)
        let fav: GameId | null = null;
        let maxPlayed = 0;
        for (const [id, stats] of Object.entries(newGames)) {
          if (stats.played > maxPlayed) {
            maxPlayed = stats.played;
            fav = id as GameId;
          }
        }

        return {
          games: newGames,
          totalGames: state.totalGames + 1,
          favoriteGame: fav
        };
      }),

      resetStats: () =>
      set({
        games: {} as Record<GameId, GameStats>,
        totalGames: 0,
        favoriteGame: null
      })
    }),
    {
      name: 'gamehub-statistics'
    }
  )
);