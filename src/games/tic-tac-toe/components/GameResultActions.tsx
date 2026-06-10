import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Frown, Minus } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { MatchStatus, PlayerSlot, GameMode } from '../../../entities/game-engine/types';

interface GameResultActionsProps {
  isVisible: boolean;
  status: MatchStatus;
  winner: PlayerSlot | null;
  mode: GameMode;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const GameResultActions: React.FC<GameResultActionsProps> = ({
  isVisible,
  status,
  winner,
  mode,
  onPlayAgain,
  onBackToMenu,
}) => {
  if (!isVisible) return null;

  let title = '';
  let icon = null;

  if (status === 'draw') {
    title = 'Draw Game';
    icon = (
      <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 text-yellow-500">
        <Minus size={40} />
      </div>
    );
  } else if (mode === 'local') {
    title = `Player ${winner === 0 ? 'X' : 'O'} Wins!`;
    icon = (
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${winner === 0 ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
        <Trophy size={40} />
      </div>
    );
  } else {
    // Online mode
    const isWinner = winner !== null; // Simplified logic, assuming winner is determined
    title = isWinner ? 'You Won!' : 'You Lost';
    icon = (
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isWinner ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
        {isWinner ? <Trophy size={40} /> : <Frown size={40} />}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center mt-2 w-full max-w-sm px-4"
    >
      {icon}
      <h2 className="text-3xl font-bold text-tg-text mb-8">{title}</h2>
      <div className="flex flex-col gap-3 w-full">
        {mode === 'local' && (
          <Button onClick={onPlayAgain} size="lg" fullWidth>
            Play Again
          </Button>
        )}
        <Button
          onClick={onBackToMenu}
          variant={mode === 'local' ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
        >
          Back To Menu
        </Button>
      </div>
    </motion.div>
  );
};
