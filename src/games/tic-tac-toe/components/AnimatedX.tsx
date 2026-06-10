import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedX: React.FC<{ className?: string; isRemoving?: boolean }> = ({ className, isRemoving }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <motion.path
      d="M 20 20 L 80 80"
      stroke="#3b82f6"
      strokeWidth="10"
      strokeLinecap="round"
      initial={{ pathLength: isRemoving ? 1 : 0 }}
      animate={{ pathLength: isRemoving ? 0 : 1 }}
      transition={{ duration: 0.125, ease: "linear" }}
    />
    <motion.path
      d="M 80 20 L 20 80"
      stroke="#3b82f6"
      strokeWidth="10"
      strokeLinecap="round"
      initial={{ pathLength: isRemoving ? 1 : 0 }}
      animate={{ pathLength: isRemoving ? 0 : 1, transition: { delay: 0.125, duration: 0.125, ease: "linear" } }}
    />
  </svg>
);
