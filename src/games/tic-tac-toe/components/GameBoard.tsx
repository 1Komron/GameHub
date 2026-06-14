import React, { useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
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

  const currentSlot = engine && gameState ? engine.getCurrentSlot(gameState) : 0;
  const pieceHistory = boardState?.pieceHistory;

  const oldestIndex = (!isGameOver && variant === 'shift' && currentSlot !== null && pieceHistory?.[currentSlot]?.length === 3)
      ? (pieceHistory?.[currentSlot]?.[0] ?? null)
      : null;

  const canInteract = ready && !isGameOver && (mode === 'local' || mode === 'online' && currentSlot === mySlot);

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

  const getLineStyles = () => {
    if (!winningLine) return null;
    const sortedLine = [...winningLine].sort((x, y) => x - y);
    const [a, , c] = sortedLine;
    
    // Horizontal (with vertical alignment correction)
    if (a === 0 && c === 2) return { top: '15.6%', left: '5%', right: '5%', height: '6px', marginTop: '-3px', rotate: 0 };
    if (a === 3 && c === 5) return { top: '50.0%', left: '5%', right: '5%', height: '6px', marginTop: '-3px', rotate: 0 };
    if (a === 6 && c === 8) return { top: '84.4%', left: '5%', right: '5%', height: '6px', marginTop: '-3px', rotate: 0 };
    
    // Vertical (with horizontal alignment correction)
    if (a === 0 && c === 6) return { left: '15.6%', top: '5%', bottom: '5%', width: '6px', marginLeft: '-3px', rotate: 0 };
    if (a === 1 && c === 7) return { left: '50.0%', top: '5%', bottom: '5%', width: '6px', marginLeft: '-3px', rotate: 0 };
    if (a === 2 && c === 8) return { left: '84.4%', top: '5%', bottom: '5%', width: '6px', marginLeft: '-3px', rotate: 0 };
    
    // Diagonals (centered and extended slightly for better HUD style looks)
    if (a === 0 && c === 8) return { top: '50%', left: '2%', right: '2%', height: '6px', marginTop: '-3px', rotate: 45, transformOrigin: 'center' };
    if (a === 2 && c === 6) return { top: '50%', left: '2%', right: '2%', height: '6px', marginTop: '-3px', rotate: -45, transformOrigin: 'center' };
    
    return null;
  };

  const lineStyle = getLineStyles();
  const winnerMark = winningLine ? board[winningLine[0]] : null;

  return (
    <LayoutGroup>
      <div className="relative w-full max-w-[340px] aspect-square mx-auto">
        
        {/* 1. DRIFTING CYBER-PARTICLES (Neon dust behind board) */}
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 260 - 130, 
                y: Math.random() * 260 - 130, 
                opacity: Math.random() * 0.2 + 0.1,
                scale: Math.random() * 0.5 + 0.5 
              }}
              animate={{
                y: [null, Math.random() * 80 - 40, Math.random() * 80 - 40],
                x: [null, Math.random() * 80 - 40, Math.random() * 80 - 40],
                opacity: [0.1, 0.45, 0.1],
              }}
              transition={{
                duration: 12 + i * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={cn(
                "absolute w-1.5 h-1.5 rounded-full",
                i % 2 === 0 
                  ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" 
                  : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"
              )}
            />
          ))}
        </div>

        {/* 2. DYNAMIC AMBIENT TURN GLOW (Atmospheric background behind board) */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
          <motion.div 
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.18, 0.28, 0.18]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={cn(
              "absolute w-64 h-64 rounded-full blur-[80px] transition-colors duration-700 ease-in-out",
              isGameOver
                ? (winnerMark === 0 
                    ? 'bg-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.3)]' 
                    : winnerMark === 1 
                      ? 'bg-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)]' 
                      : 'bg-amber-500/30')
                : (currentSlot === 0 
                    ? 'bg-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.2)]' 
                    : 'bg-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.2)]')
            )}
          />
        </div>

        {/* 3. THE MAIN BOARD CONTAINER */}
        <div className="w-full h-full bg-[#0d1321]/80 border border-slate-800/80 rounded-3xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-md relative z-10 overflow-hidden">
          
          {/* HOLOGRAPHIC SCANLINE (Sweeping laser sweep) */}
          <motion.div
            animate={{ y: ['-100%', '200%'] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent pointer-events-none z-10"
          />

          <div className="relative w-full h-full">
            {/* Grid container */}
            <div className="grid grid-cols-3 grid-rows-3 h-full w-full gap-2.5 relative z-10">
              {board.map((cell: Cell, index: number) => {
                const isWinningCell = winningLine?.includes(index);
                const symbolOpacity = isGameOver 
                  ? (isWinningCell ? 1 : 0.35) 
                  : 1;

                return (
                  <motion.button
                    key={index}
                    whileTap={canInteract && !cell && !isGameOver ? { scale: 0.95 } : {}}
                    onClick={() => handleCellClick(index)}
                    disabled={!canInteract}
                    className={cn(
                      'relative flex items-center justify-center rounded-2xl bg-slate-950/50 border border-slate-900/60 transition-all duration-300 outline-none overflow-hidden',
                      canInteract && !cell && 'hover:bg-slate-900/30 hover:border-blue-500/30 active:border-blue-400/40 shadow-inner'
                    )}
                  >
                    {/* HUD Corner Accents on Active Empty Cells */}
                    {canInteract && !cell && !isGameOver && (
                      <motion.div
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 pointer-events-none"
                      >
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
                      </motion.div>
                    )}

                    {/* Render Core Symbol */}
                    <AnimatePresence mode="popLayout">
                      {cell !== null && (
                        <motion.div
                          key={`cell-${index}-${cell}`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: symbolOpacity }}
                          exit={{ scale: 0, opacity: 0 }}
                          className={cn(
                            "flex items-center justify-center w-full h-full",
                            index === oldestIndex && 'animate-blink'
                          )}
                        >
                          {cell === 0 ? (
                            <AnimatedX className="w-12 h-12" />
                          ) : (
                            <AnimatedO className="w-10 h-10" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            {/* 4. NEON WINNING LINE OVERLAY */}
            {winningLine && lineStyle && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: lineStyle.rotate }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                className={cn(
                  "absolute rounded-full pointer-events-none z-20",
                  winnerMark === 0 
                    ? "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.9)]" 
                    : "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)]"
                )}
                style={lineStyle}
              />
            )}

            {/* Ghost Piece Overlay (For Shift Mode) */}
            {ghostPiece && (
              <div className="absolute inset-0 z-30 pointer-events-none">
                {(() => {
                  // Helper within local scope manually calculated centered percentage
                  const col = ghostPiece.index % 3;
                  const row = Math.floor(ghostPiece.index / 3);
                  const posX = col === 0 ? '15.6%' : col === 1 ? '50%' : '84.4%';
                  const posY = row === 0 ? '15.6%' : row === 1 ? '50%' : '84.4%';
                  return (
                    <div
                      className="absolute w-[33.33%] h-[33.33%] flex items-center justify-center"
                      style={{ 
                        left: posX, 
                        top: posY, 
                        transform: 'translate(-50%, -50%)',
                        marginLeft: '3px',
                        marginTop: '3px'
                      }}
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
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
};
