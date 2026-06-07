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
  const { engine, gameState, makeMove, mode, mySlot, variant } = useGameStore();

  const boardState = gameState as TicTacToeState | null;
  const board = boardState?.board ?? [];
  const ready = Boolean(engine && gameState);
  const status = ready ? engine!.getStatus(gameState!) : 'draw';
  const isGameOver = status === 'won' || status === 'draw';
  const winningLine = boardState?.winningLine ?? null;

  const currentSlot = engine && gameState ? engine.getCurrentSlot(gameState) : null;
  const pieceHistory = boardState?.pieceHistory;

  // Calculate oldest piece index for blinking
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
    
    // Centers of cells 0-8 in % (0-33, 33-66, 66-100)
    // Centers: 16.66%, 50%, 83.33%
    const getPos = (index: number) => ({
      x: (index % 3) * 33.33 + 16.66,
      y: Math.floor(index / 3) * 33.33 + 16.66
    });

    const pos1 = getPos(start);
    const pos2 = getPos(end);
    
    // Calculate direction vector to extend line
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    // Extension factor - 8% for better strike-through look
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
      <motion.div 
        animate={{ y: isGameOver ? -24 : 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[360px] aspect-square mx-auto"
      >
        <div className="grid grid-cols-3 grid-rows-3 h-full w-full rounded-2xl overflow-hidden bg-tg-bg ring-1 ring-slate-300 dark:ring-slate-600 shadow-lg relative z-10">
          {board.map((cell: any, index: number) => {
            const isWinningCell = winningLine?.includes(index);
            const opacity = isGameOver 
              ? (status === 'draw' ? 0.6 : (isWinningCell ? 1 : 0.45))
              : 1;

            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!canInteract}
                style={{ opacity }}
                className={cn(
                  'relative flex items-center justify-center transition-opacity duration-500 ease-in-out outline-none border-slate-300 dark:border-slate-600',
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
                    className={cn(index === oldestIndex && 'animate-blink')}
                  >
                    {cell === 0 ? <X className="text-blue-500 w-12 h-12" strokeWidth={3} /> : <Circle className="text-red-500 w-10 h-10" strokeWidth={3.5} />}
                  </motion.div>
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
              transition={{ duration: 0.5, delay: 0.5 }}
            />
          </svg>
        )}
      </motion.div>
    </LayoutGroup>
  );
};
