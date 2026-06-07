import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../entities/game/model/store';
import { useSettingsStore } from '../entities/settings/model/store';
import { cn } from '../shared/lib/utils';
import { X, Circle } from 'lucide-react';
import type {
  TicTacToeState,
  TicTacToeMove } from
'../entities/game/tic-tac-toe/engine';
import type { PlayerSlot } from '../entities/game-engine/types';
import { soundService } from '../shared/lib/sound';
export const GameBoard: React.FC = () => {
  const { engine, gameState, makeMove, mode, mySlot } = useGameStore();
  const { animationsEnabled } = useSettingsStore();
  if (!engine || !gameState) return null;
  const { board, winningLine, pieceHistory, mode: gameMode } = gameState as TicTacToeState;
  const status = engine.getStatus(gameState);
  const isGameOver = status === 'won' || status === 'draw';
  const currentSlot = engine.getCurrentSlot(gameState);
  // In online mode, you can only click if it's your turn.
  const canInteract =
  mode === 'local' || mode === 'online' && currentSlot === mySlot;
  const handleCellClick = (index: number) => {
    if (!canInteract || isGameOver || board[index] !== null) return;
    soundService.play('move');
    makeMove({
      index
    } as TicTacToeMove);
  };
  return (
    <motion.div
      className="relative w-full max-w-[360px] aspect-square mx-auto"
      initial={
      animationsEnabled ?
      {
        opacity: 0,
        scale: 0.92
      } :
      false
      }
      animate={{
        opacity: 1,
        scale: 1
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 24
      }}>
      
      {/* Classic grid: a single field with visible internal separator lines. */}
      <div className="grid grid-cols-3 grid-rows-3 h-full w-full rounded-2xl overflow-hidden bg-tg-bg ring-1 ring-slate-300 dark:ring-slate-600 shadow-lg">
        {board.map((cell: any, index: number) => {
          const isWinningCell = winningLine?.includes(index);
          const isInteractable = canInteract && !isGameOver && cell === null;
          
          // Shift mode: identify oldest piece to blink
          const isOldest = 
            gameMode === 'shift' && 
            cell !== null &&
            pieceHistory[cell as PlayerSlot]?.length === 3 &&
            pieceHistory[cell as PlayerSlot][0] === index;

          // Internal grid lines: right border on cols 0–1, bottom on rows 0–1.
          const hasRight = index % 3 !== 2;
          const hasBottom = index < 6;
          return (
            <motion.button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={!isInteractable}
              className={cn(
                'relative flex items-center justify-center transition-colors duration-150 outline-none',
                'border-slate-300 dark:border-slate-600',
                hasRight && 'border-r-4',
                hasBottom && 'border-b-4',
                isInteractable ?
                'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 focus-visible:bg-slate-100 dark:focus-visible:bg-slate-800/60' :
                'cursor-default'
              )}
              aria-label={`Cell ${index + 1}${cell === 0 ? ', X' : cell === 1 ? ', O' : ', empty'}`}>
              
              {/* Animated winning-cell highlight sits beneath the mark. */}
              {isWinningCell &&
              <motion.span
                layoutId={`win-${index}`}
                initial={
                animationsEnabled ?
                {
                  opacity: 0,
                  scale: 0.6
                } :
                false
                }
                animate={{
                  opacity: 1,
                  scale: 1
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 18
                }}
                className="absolute inset-1 rounded-lg bg-green-500/25 ring-2 ring-green-500" />

              }

              <motion.div
                className={cn(
                  "flex items-center justify-center w-full h-full",
                  isOldest && "animate-blink"
                )}
                whileTap={
                isInteractable && animationsEnabled ?
                {
                  scale: 0.94
                } :
                undefined
                }>
                
                {cell === 0 &&
                <motion.span
                  className="relative z-10 flex items-center justify-center w-full h-full"
                  initial={
                  animationsEnabled ?
                  {
                    scale: 0,
                    rotate: -45
                  } :
                  false
                  }
                  animate={{
                    scale: 1,
                    rotate: 0
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }}>
                  
                    <X
                    className={cn(
                      'w-[58%] h-[58%] min-w-12 min-h-12',
                      isWinningCell ?
                      'text-green-600 dark:text-green-400' :
                      'text-blue-500'
                    )}
                    strokeWidth={3} />
                  
                  </motion.span>
                }

                {cell === 1 &&
                <motion.span
                  className="relative z-10 flex items-center justify-center w-full h-full"
                  initial={
                  animationsEnabled ?
                  {
                    scale: 0
                  } :
                  false
                  }
                  animate={{
                    scale: 1
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20
                  }}>
                  
                    <Circle
                    className={cn(
                      'w-[50%] h-[50%] min-w-10 min-h-10',
                      isWinningCell ?
                      'text-green-600 dark:text-green-400' :
                      'text-red-500'
                    )}
                    strokeWidth={3.5} />
                  
                  </motion.span>
                }
              </motion.div>
            </motion.button>);

        })}
      </div>

      {/* Animated winning line drawn above the grid and symbols. */}
      {winningLine &&
      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
        viewBox="0 0 3 3"
        preserveAspectRatio="none"
        aria-hidden="true">
        
          <motion.line
          x1={winningLine[0] % 3 + 0.5}
          y1={Math.floor(winningLine[0] / 3) + 0.5}
          x2={winningLine[2] % 3 + 0.5}
          y2={Math.floor(winningLine[2] / 3) + 0.5}
          stroke="#22c55e"
          strokeWidth={0.14}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.7))',
            strokeWidth: 10
          }}
          initial={
          animationsEnabled ?
          {
            pathLength: 0,
            opacity: 0
          } :
          false
          }
          animate={{
            pathLength: 1,
            opacity: 1
          }}
          transition={
          animationsEnabled ?
          {
            pathLength: {
              duration: 0.65,
              ease: 'easeInOut'
            },
            opacity: {
              duration: 0.15
            }
          } :
          {
            duration: 0
          }
          } />
        
        </svg>
      }
    </motion.div>);

};