import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedO: React.FC<{ className?: string; isRemoving?: boolean }> = ({ className, isRemoving }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <motion.circle
      cx="50"
      cy="50"
      r="40"
      stroke="#ef4444"
      strokeWidth="10"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: isRemoving ? 1 : 0 }}
      animate={{ pathLength: isRemoving ? 0 : 1 }}
      transition={{ duration: 0.25, ease: "linear" }}
    />
  </svg>
);
