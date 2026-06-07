import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Frown, Minus } from 'lucide-react';
import { useGameStore } from '../entities/game/model/store';
import { useStatisticsStore } from '../entities/statistics/model/store';
import { useSettingsStore } from '../entities/settings/model/store';
import { useRoomStore } from '../entities/room/model/store';
import { Button } from '../shared/ui/Button';
import { soundService } from '../shared/lib/sound';
import type { MatchResult } from '../entities/game-engine/types';
export const GameOverModal: React.FC = () => {
  const navigate = useNavigate();
  const { engine, gameState, mode, mySlot, resetGame, gameId, matchId } = useGameStore();
  const { recordResult } = useStatisticsStore();
  const { animationsEnabled } = useSettingsStore();
  const { leaveRoom } = useRoomStore();
  const lastProcessedMatchIdRef = useRef<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const status = engine && gameState ? engine.getStatus(gameState) : 'idle';
  const isGameOver = status === 'won' || status === 'draw';
  const winnerSlot = engine && gameState ? engine.getWinner(gameState) : null;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGameOver) {
      timer = setTimeout(() => setShowModal(true), 2000);
    } else {
      setShowModal(false);
    }
    return () => clearTimeout(timer);
  }, [isGameOver]);

  // Record stats and play sound when game ends
  useEffect(() => {
    // 1. We only process the result if the game is over, we have a matchId, 
    //    and we haven't already processed this specific matchId.
    if (isGameOver && matchId && lastProcessedMatchIdRef.current !== matchId) {
      lastProcessedMatchIdRef.current = matchId;
      
      let result: MatchResult = 'draw';
      if (status === 'won') {
        if (mode === 'local') {
          // Local wins are not attributed to the user
          result = 'none';
        } else {
          // In online, it's relative to mySlot
          result = winnerSlot === mySlot ? 'win' : 'loss';
        }
      }
      
      if (gameId) {
        // Stats logic
        if (mode === 'local') {
          // Record 'draw' for draws, 'none' for wins (still increments 'played')
          recordResult(gameId, status === 'draw' ? 'draw' : 'none');
        } else {
          recordResult(gameId, result);
        }
      }
      
      // Sound logic - for local wins we still play the win sound
      if (status === 'won') {
        if (mode === 'local' || result === 'win') {
          soundService.play('win');
        } else {
          soundService.play('loss');
        }
      } else {
        soundService.play('notification');
      }
    }
  }, [isGameOver, status, winnerSlot, mode, mySlot, gameId, matchId, recordResult]);
  if (!isGameOver || !showModal) return null;
  const handlePlayAgain = () => {
    soundService.play('click');
    resetGame();
  };
  const handleBackToMenu = () => {
    soundService.play('click');
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