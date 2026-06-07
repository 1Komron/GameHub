import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../entities/settings/model/store';
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}
export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled
}) => {
  const { animationsEnabled } = useSettingsStore();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tg-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-tg-primary' : 'bg-tg-hint/30'
      )}>
      
      <motion.span
        layout={animationsEnabled}
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )} />
      
    </button>);

};