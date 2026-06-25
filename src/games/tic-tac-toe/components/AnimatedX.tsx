import React from 'react';
import { cn } from '../../../shared/lib/utils';

export const AnimatedX: React.FC<{ className?: string; isRemoving?: boolean; animationsEnabled: boolean }> = ({ 
  className, 
  isRemoving, 
  animationsEnabled 
}) => {
  if (!animationsEnabled) {
    return (
      <svg viewBox="0 0 100 100" className={cn(className)}>
        <path d="M 25 25 L 75 75" stroke="#60a5fa" strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M 75 25 L 25 75" stroke="#60a5fa" strokeWidth="12" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className={cn(className)}>
      <path
        pathLength={1}
        d="M 25 25 L 75 75"
        stroke="#60a5fa"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        className={isRemoving ? "animate-draw-out-delay-1" : "animate-draw-in"}
        style={{ strokeDasharray: 1 }}
      />
      <path
        pathLength={1}
        d="M 75 25 L 25 75"
        stroke="#60a5fa"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        className={isRemoving ? "animate-draw-out" : "animate-draw-in-delay-1"}
        style={{ strokeDasharray: 1 }}
      />
    </svg>
  );
};
