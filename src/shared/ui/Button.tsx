import { forwardRef } from 'react';
import { cn } from '../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useSettingsStore } from '../../entities/settings/model/store';
interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
  {
    className,
    variant = 'primary',
    size = 'md',
    fullWidth,
    children,
    ...props
  },
  ref) =>
  {
    const { animationsEnabled } = useSettingsStore();
    const baseStyles =
    'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tg-primary disabled:pointer-events-none disabled:opacity-50';
    const variants = {
      primary: 'bg-tg-primary text-tg-primary-text hover:opacity-90 shadow-sm',
      secondary:
      'bg-tg-secondary text-tg-text hover:bg-black/5 dark:hover:bg-white/5',
      outline:
      'border-2 border-tg-primary text-tg-primary hover:bg-tg-primary/10',
      ghost: 'hover:bg-tg-secondary text-tg-text'
    };
    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-12 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
      icon: 'h-12 w-12'
    };
    const motionProps = animationsEnabled ?
    {
      whileTap: {
        scale: 0.97
      },
      whileHover: {
        scale: 1.02
      }
    } :
    {};
    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...motionProps}
        {...props}>
        
        {children}
      </motion.button>);

  }
);
Button.displayName = 'Button';