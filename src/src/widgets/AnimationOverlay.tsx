import React from 'react';
import { Cell } from '../entities/game/tic-tac-toe/engine';
import { MatchStatus, PlayerSlot } from '../entities/game-engine/types';

interface AnimationOverlayProps {
  isVisible: boolean;
  status: MatchStatus;
  winner: PlayerSlot | null;
  board: Cell[];
}

export const AnimationOverlay: React.FC<AnimationOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
      Animation Overlay Mounted
    </div>
  );
};
