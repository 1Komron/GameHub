import React, { useEffect } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useGameStore } from '../store';
import { cn } from '../../../shared/lib/utils';
import type {
  TicTacToeState,
  TicTacToeMove,
  Cell } from
      '../engine';
import { soundService } from '../../../shared/lib/sound';
import { AnimatedX } from './AnimatedX';
import { AnimatedO } from './AnimatedO';

interface GameBoardProps {
  onAnimationComplete?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ onAnimationComplete }) => {
  const { engine, gameState, makeMove, mode, mySlot, variant, ghostPiece } = useGameStore();

  const boardState = gameState as TicTacToeState | null;
  console.log('GameBoard render, board:', boardState?.board);
  const board = boardState?.board ?? [];
  const ready = Boolean(engine && gameState);
  const status = (ready && engine && gameState) ? engine.getStatus(gameState) : 'draw';
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
      ? (pieceHistory?.[currentSlot]?.[0] ?? null)
      : null;

  const canInteract = ready && !isGameOver && (mode === 'local' || mode === 'online' && currentSlot === mySlot);
  console.log('canInteract debug:', { mode, currentSlot, mySlot, isGameOver, ready, canInteract });

  const handleCellClick = (index: number) => {
    if (!canInteract || board[index] !== null) return;
    soundService.play('move');
    makeMove({ index } as TicTacToeMove);
  };

  if (!ready) return null;

  const getCellPos = (index: number) => ({
    x: (index % 3) * 33.33 + 16.66,
    y: Math.floor(index / 3) * 33.33 + 16.66
  });

  const getLineCoords = (line: number[]) => {
    const start = line[0];
    const end = line[2];

    const pos1 = getCellPos(start);
    const pos2 = getCellPos(end);

    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    const ext = 8;

    const x1 = pos1.x - (dx / len) * ext;
    const y1 = pos1.y - (dy / len) * ext;
    const x2 = pos2.x + (dx / len) * ext;
    const y2 = pos2.y + (dy / len) * ext;

    return { x1, y1, x2, y2 };
  };

  const lineCoords = winningLine ? getLineCoords(winningLine) : null;

  const getWinner = () => {
    if (!winningLine || !boardState) return null;
    return boardState.board[winningLine[0]];
  };

  const winner = getWinner();
  const glowColor = (winner === 0) ? '#3b82f6' : '#ef4444';

  return (
      <LayoutGroup>
        <div className="relative w-full max-w-[360px] aspect-square mx-auto">
          <div className="grid grid-cols-3 grid-rows-3 h-full w-full rounded-2xl overflow-hidden bg-tg-bg ring-1 ring-slate-300 dark:ring-slate-600 shadow-lg relative z-10">
            {board.map((cell: Cell, index: number) => {
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

          {/* Ghost Piece Overlay */}
          {ghostPiece && (
              <div className="absolute inset-0 z-30 pointer-events-none">
                {(() => {
                  const pos = getCellPos(ghostPiece.index);
                  return (
                      <div
                          className="absolute w-[33.33%] h-[33.33%] flex items-center justify-center"
                          style={{ left: `${pos.x - 16.66}%`, top: `${pos.y - 16.66}%` }}
                      >
                        {ghostPiece.slot === 0 ? (
                            <AnimatedX className="w-12 h-12" isRemoving={true} />
                        ) : (
                            <AnimatedO className="w-10 h-10" isRemoving={true} />
                        )}
                      </div>
                  );
                })()}
              </div>
          )}

          {lineCoords && (
              <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
              >
                <defs>
                  <filter id="glow" filterUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Glow layer */}
                <motion.path
                    d={`M ${lineCoords.x1} ${lineCoords.y1} L ${lineCoords.x2} ${lineCoords.y2}`}
                    stroke={glowColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity={0.7}
                    style={{ filter: 'url(#glow)' }}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                />
                {/* Core layer */}
                <motion.path
                    d={`M ${lineCoords.x1} ${lineCoords.y1} L ${lineCoords.x2} ${lineCoords.y2}`}
                    stroke={glowColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                />
              </svg>
          )}
        </div>
      </LayoutGroup>
  );
};