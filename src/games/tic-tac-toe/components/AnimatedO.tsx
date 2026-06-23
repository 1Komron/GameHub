import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../shared/lib/utils';

export const AnimatedO: React.FC<{ className?: string; isRemoving?: boolean }> = ({ className, isRemoving }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: isRemoving ? 0 : 1, scale: isRemoving ? 0.5 : 1 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className={cn(className)}
  >
    <svg viewBox="0 0 100 100">
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
  </motion.div>
);
