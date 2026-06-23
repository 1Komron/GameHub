import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../shared/lib/utils';

export const AnimatedX: React.FC<{ className?: string; isRemoving?: boolean }> = ({ className, isRemoving }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: isRemoving ? 0 : 1, scale: isRemoving ? 0.5 : 1 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className={cn(className)}
  >
    <svg viewBox="0 0 100 100">
      <path
        d="M 25 25 L 75 75"
        stroke="#60a5fa"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 75 25 L 25 75"
        stroke="#60a5fa"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  </motion.div>
);
