import React, { useEffect } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useGameStore } from '../entities/game/model/store';
import { cn } from '../shared/lib/utils';
import type {
  TicTacToeState,
  TicTacToeMove } from
'../entities/game/tic-tac-toe/engine';
import { soundService } from '../shared/lib/sound';

interface GameBoardProps {
  onAnimationComplete?: () => void;
}

import { AnimatedX } from './AnimatedX';
import { AnimatedO } from './AnimatedO';

export const GameBoard: React.FC<GameBoardProps> = ({ onAnimationComplete }) => {
  const { engine, gameState, makeMove, mode, mySlot, variant } = useGameStore();

  const boardState = gameState as TicTacToeState | null;
  const board = boardState?.board ?? [];
  const ready = Boolean(engine && gameState);
  const status = ready ? engine!.getStatus(gameState!) : 'draw';
  const isGameOver = status === 'won' || status === 'draw';
  const winningLine = boardState?.winningLine ?? null;

  useEffect(() => {
    if (isGameOver) {
      const delay = status === 'won' ? 700 : 300;
      const timer = setTimeout(() => {
        onAnimationComplete?.();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isGameOver, status, onAnimationComplete]);

  const currentSlot = engine && gameState ? engine.getCurrentSlot(gameState) : null;
  const pieceHistory = boardState?.pieceHistory;

  const oldestIndex = (!isGameOver && variant === 'shift' && currentSlot !== null && pieceHistory?.[currentSlot]?.length === 3)
    ? pieceHistory[currentSlot][0]
    : null;

  const canInteract = ready && !isGameOver && (mode === 'local' || mode === 'online' && currentSlot === mySlot);

  const handleCellClick = (index: number) => {
    if (!canInteract || board[index] !== null) return;
    soundService.play('move');
    makeMove({ index } as TicTacToeMove);
  };

  if (!ready) return null;

  // Helpers for line drawing
  const getLineCoords = (line: number[]) => {
    const start = line[0];
    const end = line[2];
    
    const getPos = (index: number) => ({
      x: (index % 3) * 33.33 + 16.66,
      y: Math.floor(index / 3) * 33.33 + 16.66
    });

    const pos1 = getPos(start);
    const pos2 = getPos(end);
    
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    const ext = 8; 
    
    const x1 = pos1.x - (dx / len) * ext;
    const y1 = pos1.y - (dy / len) * ext;
    const x2 = pos2.x + (dx / len) * ext;
    const y2 = pos2.y + (dy / len) * ext;
    
    return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
  };

  const lineCoords = winningLine ? getLineCoords(winningLine) : null;

  const getWinner = () => {
    if (!winningLine || !boardState) return null;
    return boardState.board[winningLine[0]];
  };

  const winner = getWinner();
  const lineColor = winner === 0 ? 'text-blue-500' : 'text-red-500';

  return (
    <LayoutGroup>
      <div className="relative w-full max-w-[360px] aspect-square mx-auto">
        <div className="grid grid-cols-3 grid-rows-3 h-full w-full rounded-2xl overflow-hidden bg-tg-bg ring-1 ring-slate-300 dark:ring-slate-600 shadow-lg relative z-10">
          {board.map((cell: any, index: number) => {
            const isWinningCell = winningLine?.includes(index);
            const symbolOpacity = isGameOver 
              ? (status === 'draw' ? 0.6 : (isWinningCell ? 1 : 0.45))
              : 1;

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
                  !isGameOver ? (
                    <motion.div 
                      layoutId={`cell-${index}`}
                      style={{ opacity: symbolOpacity, transition: 'opacity 300ms ease-in-out' }}
                      className={cn(index === oldestIndex && 'animate-blink')}
                    >
                      {cell === 0 ? (
                        <AnimatedX className="w-12 h-12" />
                      ) : (
                        <AnimatedO className="w-10 h-10" />
                      )}
                    </motion.div>
                  ) : (
                    <div 
                      style={{ opacity: symbolOpacity, transition: 'opacity 300ms ease-in-out' }}
                      className={cn(index === oldestIndex && 'animate-blink')}
                    >
                      {cell === 0 ? (
                        <AnimatedX className="w-12 h-12" />
                      ) : (
                        <AnimatedO className="w-10 h-10" />
                      )}
                    </div>
                  )
                )}
              </button>
            );
          })}
        </div>

        {lineCoords && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            <motion.line
              x1={lineCoords.x1} y1={lineCoords.y1}
              x2={lineCoords.x2} y2={lineCoords.y2}
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className={lineColor}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            />
          </svg>
        )}
      </div>
    </LayoutGroup>
  );
};