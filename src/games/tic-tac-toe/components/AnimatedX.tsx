import React from 'react';
import { motion } from 'framer-motion';
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
      <motion.path
        d="M 25 25 L 75 75"
        stroke="#60a5fa"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: isRemoving ? 1 : 0 }}
        animate={{ pathLength: isRemoving ? 0 : 1 }}
        transition={{ duration: 0.125, ease: "linear", delay: isRemoving ? 0.125 : 0 }}
      />
      <motion.path
        d="M 75 25 L 25 75"
        stroke="#60a5fa"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: isRemoving ? 1 : 0 }}
        animate={{ pathLength: isRemoving ? 0 : 1 }}
        transition={{ duration: 0.125, ease: "linear", delay: isRemoving ? 0 : 0.125 }}
      />
    </svg>
  );
};
