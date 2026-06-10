import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameBoard } from '../games/tic-tac-toe/components/GameBoard';
import { GameResultActions } from '../games/tic-tac-toe/components/GameResultActions';
import { useGameStore } from '../games/tic-tac-toe/store';
import { useRoomStore } from '../entities/room/model/store';
import { useStatisticsStore } from '../entities/statistics/model/store';
import { GlassCard } from '../shared/ui/GlassCard';
import { getEngineById } from '../shared/config/engines';
import { soundService } from '../shared/lib/sound';
export const PlayOnline: React.FC = () => {
  const navigate = useNavigate();
  const { initOnline, resetGame, engine, gameState, mySlot, matchId } = useGameStore();
  const { room, mySlot: roomSlot, leaveRoom } = useRoomStore();
  const { recordResult } = useStatisticsStore();
  const lastProcessedMatchIdRef = useRef<string | null>(null);

  // Define status and gameOver unconditionally to satisfy rules-of-hooks
  const status = (engine && gameState) ? engine.getStatus(gameState) : 'playing';
  const isGameOver = status === 'won' || status === 'draw';
  const winner = status === 'won' ? (engine && gameState ? engine.getWinner(gameState) : null) : null;

  useEffect(() => {
    if (!room) {
      navigate('/');
      return;
    }
    const engine = getEngineById(room.gameId ?? '');
    if (engine && roomSlot !== null) {
      initOnline(engine, roomSlot);
    }
    return () => resetGame();
  }, [room, roomSlot, initOnline, resetGame, navigate]);

  useEffect(() => {
    if (isGameOver && matchId && lastProcessedMatchIdRef.current !== matchId && room) {
      lastProcessedMatchIdRef.current = matchId;

      let result: 'win' | 'loss' | 'draw' = 'draw';
      if (status === 'won') {
        result = winner === mySlot ? 'win' : 'loss';
      }

      if (room.gameId) {
        recordResult(room.gameId, result);
      }

      if (status === 'won') {
        soundService.play(result === 'win' ? 'win' : 'loss');
      } else {
        soundService.play('notification');
      }
    }
  }, [isGameOver, status, winner, mySlot, room, matchId, recordResult]);

  if (!engine || !gameState || !room) return null;

  const currentSlot = engine.getCurrentSlot(gameState);
  const isMyTurn = currentSlot === mySlot;
  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full">
      <main className="flex-1 flex flex-col items-center p-4 gap-2">
        <AnimatePresence mode="wait">
          {!isGameOver && (
            <motion.div
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
          )}
        </AnimatePresence>

        {room.gameId === 'tic-tac-toe' && <GameBoard />}
        <GameResultActions 
          isVisible={isGameOver}
          status={status}
          winner={winner}
          mode="online"
          onPlayAgain={() => { console.log('Play again'); }} 
          onBackToMenu={handleLeave}
        />
      </main>
    </div>
  );
};