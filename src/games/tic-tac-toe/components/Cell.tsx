import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../shared/lib/utils';
import { AnimatedX } from './AnimatedX';
import { AnimatedO } from './AnimatedO';

interface CellProps {
  index: number;
  cellValue: any; // Seat or null (from engine)
  isHiddenDuringMerge: boolean;
  symbolOpacity: number;
  isExpiring: boolean;
  canInteract: boolean;
  isGameOver: boolean;
  currentSlot: number | null;
  animationsEnabled: boolean;
  onCellClick: (index: number) => void;
}

export const Cell = React.memo(({
  index,
  cellValue,
  isHiddenDuringMerge,
  symbolOpacity,
  isExpiring,
  canInteract,
  isGameOver,
  currentSlot,
  animationsEnabled,
  onCellClick,
}: CellProps) => {
  const isOccupied = cellValue !== null;

  return (
    <motion.button
      whileTap={canInteract && !isOccupied && !isGameOver ? { scale: 0.95 } : {}}
      onClick={() => onCellClick(index)}
      disabled={!canInteract}
      className={cn(
        'relative flex items-center justify-center rounded-2xl bg-slate-950/50 border border-slate-900/60 transition-all duration-300 outline-none overflow-hidden',
        canInteract && !isOccupied && 'md:hover:bg-slate-900/30 md:hover:border-blue-500/30 active:bg-slate-900/20 active:border-blue-400/40 shadow-inner'
      )}
    >
      {/* HUD Corner Accents on Active Empty Cells */}
      {canInteract && !isOccupied && !isGameOver && (
        <div className={cn(
          "absolute inset-0 pointer-events-none",
          animationsEnabled ? "animate-hud-pulse" : "opacity-50"
        )}>
          {/* Top-Left Bracket */}
          <span className={cn(
            "absolute top-1.5 left-1.5 w-2 h-2 border-t border-l rounded-tl-sm transition-colors duration-500",
            currentSlot === 0 ? "border-blue-500/40" : "border-red-500/40"
          )} />
          {/* Bottom-Right Bracket */}
          <span className={cn(
            "absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r rounded-br-sm transition-colors duration-500",
            currentSlot === 0 ? "border-blue-500/40" : "border-red-500/40"
          )} />
        </div>
      )}

      {/* Render Core Symbol */}
      <AnimatePresence>
        {isOccupied && !isHiddenDuringMerge && (
          <motion.div
            key={`cell-${index}-${cellValue}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: symbolOpacity }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "flex items-center justify-center w-full h-full",
              isExpiring && !isGameOver && 'animate-blink'
            )}
          >
            {cellValue === 0 ? (
              <AnimatedX className="w-12 h-12" />
            ) : (
              <AnimatedO className="w-10 h-10" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

Cell.displayName = 'Cell';
