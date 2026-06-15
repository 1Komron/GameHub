import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../shared/lib/utils';
import { MatchStatus, PlayerSlot, GameMode } from '../../../entities/game-engine/types';

interface GameResultActionsProps {
  isVisible: boolean;
  status: MatchStatus;
  winner: PlayerSlot | null;
  isWinner?: boolean;
  mode: GameMode;
  onPlayAgain?: () => void;
  onBackToMenu: () => void;
}

export const GameResultActions: React.FC<GameResultActionsProps> = ({
  isVisible,
  status,
  winner,
  isWinner,
  mode,
  onPlayAgain,
  onBackToMenu,
}) => {
  if (!isVisible) return null;

  const isDraw = status === 'draw';
  const isWinnerMe = mode === 'online' ? isWinner : (winner !== null);
  const colorClass = isWinnerMe ? 'text-emerald-400' : isDraw ? 'text-amber-400' : 'text-red-400';
  const title = isDraw ? 'Draw Game' : (mode === 'online' ? (isWinnerMe ? 'You Won!' : 'You Lost') : `Player ${winner === 0 ? 'X' : 'O'} Wins!`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
      className="flex flex-col items-center gap-6 w-full max-w-sm px-4"
    >
      <div className="flex flex-col items-center gap-4 w-full pt-2">
        {/* Holographic Glitch Title */}
        <motion.h2 
          animate={{
            x: [0, -1.5, 1.5, -1, 1, 0],
            opacity: [1, 0.92, 1, 0.88, 1, 1]
          }}
          transition={{
            duration: 0.35,
            ease: "easeInOut",
            repeat: 0
          }}
          className={cn("text-3xl font-extrabold tracking-wider text-center uppercase", colorClass)}
        >
          {title}
        </motion.h2>
      </div>

      {/* Styled Action Buttons */}
      <div className="flex flex-col gap-4 w-full pt-2">
        {mode === 'local' && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onPlayAgain}
            className="w-full py-4 bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold rounded-2xl border border-white/[0.1] backdrop-blur-md transition-all duration-200"
          >
            Play Again
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBackToMenu}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all duration-200"
        >
          Back To Menu
        </motion.button>
      </div>
    </motion.div>
  );
};
