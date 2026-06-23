import React from 'react';
import { motion } from 'framer-motion';
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
      <motion.circle
        cx="50"
        cy="50"
        r="35"
        stroke="#f87171"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: isRemoving ? 1 : 0 }}
        animate={{ pathLength: isRemoving ? 0 : 1 }}
        transition={{ duration: 0.25, ease: "linear" }}
      />
    </svg>
  );
};
