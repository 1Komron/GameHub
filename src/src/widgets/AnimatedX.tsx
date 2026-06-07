import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedX: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <motion.path
      d="M 20 20 L 80 80"
      stroke="#3b82f6"
      strokeWidth="10"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.2, ease: "linear" }}
    />
    <motion.path
      d="M 80 20 L 20 80"
      stroke="#3b82f6"
      strokeWidth="10"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1, transition: { delay: 0.15, duration: 0.2, ease: "linear" } }}
    />
  </svg>
);
