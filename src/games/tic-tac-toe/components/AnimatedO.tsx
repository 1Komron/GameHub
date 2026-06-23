import React from 'react';
import { cn } from '../../../shared/lib/utils';

export const AnimatedO: React.FC<{ className?: string; isRemoving?: boolean }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={cn(className)}>
    <circle
      cx="50"
      cy="50"
      r="35"
      stroke="#f87171"
      strokeWidth="12"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);
