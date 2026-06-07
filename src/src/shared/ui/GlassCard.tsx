import React, { forwardRef } from 'react';
import { cn } from '../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useSettingsStore } from '../../entities/settings/model/store';
interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: React.ReactNode;
  interactive?: boolean;
}
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, interactive = false, ...props }, ref) => {
    const { animationsEnabled } = useSettingsStore();
    const motionProps =
    interactive && animationsEnabled ?
    {
      whileHover: {
        y: -2,
        scale: 1.01
      },
      whileTap: {
        scale: 0.98
      }
    } :
    {};
    return (
      <motion.div
        ref={ref}
        className={cn(
          'glass-panel rounded-2xl p-6 shadow-lg',
          interactive && 'cursor-pointer',
          className
        )}
        {...motionProps}
        {...props}>
        
        {children}
      </motion.div>);

  }
);
GlassCard.displayName = 'GlassCard';