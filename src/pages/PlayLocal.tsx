import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { soundService } from '../shared/lib/sound';
import { TelegramTopSpacer } from '../shared/ui/TelegramTopSpacer';
import { GameBoard } from '../games/tic-tac-toe/components/GameBoard';
import { GameResultActions } from '../games/tic-tac-toe/components/GameResultActions';
import { useGameStore } from '../games/tic-tac-toe/store';
import { GlassCard } from '../shared/ui/GlassCard';
import { getEngineById } from '../shared/config/engines';
import { TicTacToeState, TicTacToeMove, TicTacToeVariant } from '../games/tic-tac-toe/engine';

export const PlayLocal: React.FC = () => {
  const { gameId } = useParams<{
    gameId: string;
  }>();
  // Simplified mode detection from URL or state
  const searchParams = new URLSearchParams(window.location.search);
  const mode = (searchParams.get('mode') as 'classic' | 'shift') || 'classic';
  const navigate = useNavigate();
  const { initLocal, resetGame, engine, gameState } = useGameStore();

  useEffect(() => {
    resetGame();
    return () => {
      resetGame();
    };
  }, [resetGame]);

  useEffect(() => {
    const engine = getEngineById<TicTacToeState, TicTacToeMove, TicTacToeVariant>(gameId ?? '');
    if (engine) {
      initLocal(engine, mode as never);
    }
  }, [gameId, initLocal, mode]);

  if (!engine || !gameState) return null;
  const status = engine.getStatus(gameState);
  const isGameOver = status === 'won' || status === 'draw';
  const winner = status === 'won' ? engine.getWinner(gameState) : null;
  const currentSlot = engine.getCurrentSlot(gameState);
  return (
    <div className="flex flex-col items-center justify-start min-h-screen max-w-md mx-auto w-full gap-6">
      <TelegramTopSpacer />
      <main className="flex-1 flex flex-col items-center justify-start p-4 gap-6 w-full">
        <AnimatePresence mode="wait">
          {!isGameOver ? (
              <motion.div
                  key="turn"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full"
              >
                <GlassCard className="flex items-center justify-center py-4 px-6">
                  <div className="flex items-center gap-3">
                    <span className="text-tg-hint font-medium">Current Turn:</span>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-lg ${currentSlot === 0 ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
                      {currentSlot === 0 ? 'X' : 'O'}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
          ) : (
              <motion.div
                  key="result"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full"
              >
                <GlassCard className="flex items-center justify-center py-4 px-6">
                  <div className="flex items-center gap-3">
                    {status === 'draw' ? (
                        <span className="text-yellow-500 font-bold text-lg">Draw Game!</span>
                    ) : (
                        <>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-lg ${winner === 0 ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
                            {winner === 0 ? 'X' : 'O'}
                          </div>
                          <span className="text-tg-hint font-medium">
                            Player {winner === 0 ? '1 (X)' : '2 (O)'} Wins!
                          </span>
                        </>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
          )}
        </AnimatePresence>

        <GameBoard />
        <div className="flex-1" />
        <GameResultActions
          isVisible={isGameOver}
          status={status}
          winner={winner}
          mode="local"
          onPlayAgain={() => { soundService.play('click'); resetGame(); }}
          onBackToMenu={() => { soundService.play('click'); resetGame(); navigate('/'); }}
        />
      </main>
    </div>
  );
};