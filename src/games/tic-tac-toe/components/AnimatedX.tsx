import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../shared/lib/utils';

export const AnimatedX: React.FC<{ className?: string; isRemoving?: boolean }> = ({ className, isRemoving }) => (
  <svg viewBox="0 0 100 100" className={cn(className, "drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]")}>
    <motion.path
      d="M 25 25 L 75 75"
      stroke="#60a5fa"
      strokeWidth="12"
      strokeLinecap="round"
      initial={{ pathLength: isRemoving ? 1 : 0 }}
      animate={{ pathLength: isRemoving ? 0 : 1 }}
      transition={{ duration: 0.125, ease: "linear" }}
    />
    <motion.path
      d="M 75 25 L 25 75"
      stroke="#60a5fa"
      strokeWidth="12"
      strokeLinecap="round"
      initial={{ pathLength: isRemoving ? 1 : 0 }}
      animate={{ pathLength: isRemoving ? 0 : 1, transition: { delay: 0.125, duration: 0.125, ease: "linear" } }}
    />
  </svg>
);
