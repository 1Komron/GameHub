import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameBoard } from '../games/tic-tac-toe/components/GameBoard';
import { GameResultActions } from '../games/tic-tac-toe/components/GameResultActions';
import { TelegramTopSpacer } from '../shared/ui/TelegramTopSpacer';
import { useGameStore } from '../games/tic-tac-toe/store';
import { useRoomStore } from '../entities/room/model/store';
import { GlassCard } from '../shared/ui/GlassCard';
import { getEngineById } from '../shared/config/engines';
import { TicTacToeState, TicTacToeMove, TicTacToeVariant } from '../games/tic-tac-toe/engine';

export const PlayOnline: React.FC = () => {
  const navigate = useNavigate();
  const { initOnline, resetGame, engine, gameState, mySlot } = useGameStore();

  useEffect(() => {
    resetGame();
    return () => {
      resetGame();
    };
  }, [resetGame]);

  useEffect(() => {
    const { room, mySlot: roomSlot } = useRoomStore.getState();
    if (!room) {
      navigate('/');
      return;
    }
    const gameEngine = getEngineById<TicTacToeState, TicTacToeMove, TicTacToeVariant>(room.gameId ?? '');
    if (gameEngine && roomSlot !== null) {
      initOnline(gameEngine, roomSlot);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!engine || !gameState) return null;

  const currentSlot = engine.getCurrentSlot(gameState);
  const isMyTurn = currentSlot === mySlot;
  const status = engine.getStatus(gameState);
  const isGameOver = status === 'won' || status === 'draw';
  const winner = status === 'won' ? engine.getWinner(gameState) : null;
  const iWon = winner === mySlot;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full">
      <TelegramTopSpacer />
      <main className="flex-1 flex flex-col items-center justify-start p-4 gap-6">
        <AnimatePresence mode="wait">
          {!isGameOver ? (
            <motion.div
              key="turn"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <GlassCard
                className={`flex items-center justify-center py-4 px-6 border-2 transition-colors ${isMyTurn ? 'border-tg-primary bg-tg-primary/5' : 'border-transparent'}`}>

                <div className="flex items-center gap-3">
                  <span className="text-tg-hint font-medium">
                    {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
                  </span>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-lg ${currentSlot === 0 ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>

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
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-lg ${(winner === 0) ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
                        {winner === 0 ? 'X' : 'O'}
                      </div>
                      <span className="text-tg-hint font-medium">
                        {iWon ? 'You Win!' : `Player ${winner === 0 ? 'X' : 'O'} Wins!`}
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
          winner={mySlot !== null ? (iWon ? mySlot : (mySlot === 0 ? 1 : 0)) : null}
          mode="online"
          isWinner={iWon}
          onPlayAgain={() => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
          }}
          onBackToMenu={() => {
            resetGame();
            if (!isGameOver) {
              useRoomStore.getState().leaveRoom();
            } else {
              useRoomStore.setState({ room: null, mySlot: null, matchId: null });
            }
            navigate('/');
          }}
        />
      </main>
    </div>
  );
};