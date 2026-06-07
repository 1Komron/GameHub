import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedO: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <motion.circle
      cx="50"
      cy="50"
      r="40"
      stroke="#ef4444"
      strokeWidth="10"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.35, ease: "linear" }}
    />
  </svg>
);
