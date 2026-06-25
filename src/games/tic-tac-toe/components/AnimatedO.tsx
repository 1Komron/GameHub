import React from 'react';
import { cn } from '../../../shared/lib/utils';

export const AnimatedO: React.FC<{ className?: string; isRemoving?: boolean; animationsEnabled: boolean }> = ({ 
  className, 
  isRemoving, 
  animationsEnabled 
}) => {
  if (!animationsEnabled) {
    return (
      <svg viewBox="0 0 100 100" className={cn(className)}>
        <circle cx="50" cy="50" r="35" stroke="#f87171" strokeWidth="12" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className={cn(className)}>
      <circle
        pathLength={1}
        cx="50"
        cy="50"
        r="35"
        stroke="#f87171"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
        className={isRemoving ? "animate-circle-draw-out" : "animate-circle-draw-in"}
        style={{ strokeDasharray: 1 }}
      />
    </svg>
  );
};
