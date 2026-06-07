import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useGameStore } from '../entities/game/model/store';
import { cn } from '../shared/lib/utils';
import { X, Circle } from 'lucide-react';
import type {
  TicTacToeState,
  TicTacToeMove } from
'../entities/game/tic-tac-toe/engine';
import { soundService } from '../shared/lib/sound';

export const GameBoard: React.FC = () => {
  const { engine, gameState, makeMove, mode, mySlot } = useGameStore();

  const boardState = gameState as TicTacToeState | null;
  const board = boardState?.board ?? [];
  const ready = Boolean(engine && gameState);
  const status = ready ? engine!.getStatus(gameState!) : 'draw';
  const isGameOver = status === 'won' || status === 'draw';

  const canInteract = ready && !isGameOver && (mode === 'local' || mode === 'online' && engine!.getCurrentSlot(gameState!) === mySlot);

  const handleCellClick = (index: number) => {
    if (!canInteract || board[index] !== null) return;
    soundService.play('move');
    makeMove({ index } as TicTacToeMove);
  };

  if (!ready) return null;

  return (
    <LayoutGroup>
      <div className="relative w-full max-w-[360px] aspect-square mx-auto">
        <div className="grid grid-cols-3 grid-rows-3 h-full w-full rounded-2xl overflow-hidden bg-tg-bg ring-1 ring-slate-300 dark:ring-slate-600 shadow-lg">
          {board.map((cell: any, index: number) => {
            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!canInteract}
                className={cn(
                  'relative flex items-center justify-center transition-transform duration-700 ease-in-out outline-none border-slate-300 dark:border-slate-600',
                  index % 3 !== 2 && 'border-r-4',
                  index < 6 && 'border-b-4'
                )}
              >
                {cell !== null && (
                  <motion.div 
                    layoutId={`cell-${index}`}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    {cell === 0 ? <X className="text-blue-500 w-12 h-12" strokeWidth={3} /> : <Circle className="text-red-500 w-10 h-10" strokeWidth={3.5} />}
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </LayoutGroup>
  );
};
