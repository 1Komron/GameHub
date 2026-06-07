import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Frown, Minus } from 'lucide-react';
import { useGameStore } from '../entities/game/model/store';
import { useStatisticsStore } from '../entities/statistics/model/store';
import { useSettingsStore } from '../entities/settings/model/store';
import { useRoomStore } from '../entities/room/model/store';
import { Button } from '../shared/ui/Button';
import { soundService } from '../shared/lib/sound';
export const GameOverModal: React.FC = () => {
  const navigate = useNavigate();
  const { engine, gameState, mode, mySlot, resetGame, gameId } = useGameStore();
  const { recordResult } = useStatisticsStore();
  const { animationsEnabled } = useSettingsStore();
  const { leaveRoom } = useRoomStore();
  const status = engine && gameState ? engine.getStatus(gameState) : 'idle';
  const isGameOver = status === 'won' || status === 'draw';
  const winnerSlot = engine && gameState ? engine.getWinner(gameState) : null;
  // Record stats and play sound when game ends
  useEffect(() => {
    if (isGameOver && gameId) {
      let result: 'win' | 'loss' | 'draw' = 'draw';
      if (status === 'won') {
        if (mode === 'local') {
          // In local, we just record a win for the platform stats
          result = 'win';
        } else {
          // In online, it's relative to mySlot
          result = winnerSlot === mySlot ? 'win' : 'loss';
        }
      }
      recordResult(gameId, result);
      if (result === 'win') soundService.play('win');else
      if (result === 'loss') soundService.play('loss');else
      soundService.play('notification');
    }
  }, [isGameOver, status, winnerSlot, mode, mySlot, gameId, recordResult]);
  if (!isGameOver) return null;
  const handlePlayAgain = () => {
    resetGame();
  };
  const handleBackToMenu = () => {
    resetGame();
    if (mode === 'online') {
      leaveRoom();
    }
    navigate('/');
  };
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50
    }
  };
  const overlayVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1
    },
    exit: {
      opacity: 0
    }
  };
  // Determine display message
  let title = '';
  let icon = null;
  if (status === 'draw') {
    title = 'Draw Game';
    icon =
    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 text-yellow-500">
        <Minus size={40} />
      </div>;

  } else if (mode === 'local') {
    title = `Player ${winnerSlot === 0 ? 'X' : 'O'} Wins!`;
    icon =
    <div
      className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${winnerSlot === 0 ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
      
        <Trophy size={40} />
      </div>;

  } else {
    if (winnerSlot === mySlot) {
      title = 'You Won!';
      icon =
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500">
          <Trophy size={40} />
        </div>;

    } else {
      title = 'You Lost';
      icon =
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-500">
          <Frown size={40} />
        </div>;

    }
  }
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        variants={animationsEnabled ? overlayVariants : undefined}
        initial="hidden"
        animate="visible"
        exit="exit">
        
        <motion.div
          className="w-full max-w-sm bg-tg-bg rounded-3xl shadow-2xl overflow-hidden border border-white/10"
          variants={animationsEnabled ? modalVariants : undefined}
          initial="hidden"
          animate="visible"
          exit="exit">
          
          <div className="p-8 text-center flex flex-col items-center">
            {icon}
            <h2 className="text-3xl font-bold text-tg-text mb-8">{title}</h2>

            <div className="flex flex-col gap-3 w-full">
              {mode === 'local' &&
              <Button onClick={handlePlayAgain} size="lg" fullWidth>
                  Play Again
                </Button>
              }
              <Button
                onClick={handleBackToMenu}
                variant={mode === 'local' ? 'secondary' : 'primary'}
                size="lg"
                fullWidth>
                
                Back To Menu
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

};