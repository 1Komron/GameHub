import React, { useState, useEffect } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { useGameStore } from '../entities/game/model/store';
import { cn } from '../shared/lib/utils';
import { X, Circle } from 'lucide-react';
import type {
  TicTacToeState,
  TicTacToeMove } from
'../entities/game/tic-tac-toe/engine';
import { soundService } from '../shared/lib/sound';
import { useRoomStore } from '../entities/room/model/store';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/ui/Button';

export const GameBoard: React.FC = () => {
  const { engine, gameState, makeMove, mode, mySlot, resetGame } = useGameStore();
  const { leaveRoom } = useRoomStore();
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  if (!engine || !gameState) return null;
  const { board, winningLine } = gameState as TicTacToeState;
  
  const status = engine.getStatus(gameState);
  const isGameOver = status === 'won' || status === 'draw';
  const winner = status === 'won' ? engine.getWinner(gameState as TicTacToeState) : null;

  // Animation Sequence Control
  useEffect(() => {
    if (isGameOver) {
      const sequence = async () => {
        setPhase(1); // 1: Winning Line
        await new Promise(r => setTimeout(r, 600));
        setPhase(2); // 2: Blur board
        await new Promise(r => setTimeout(r, 600));
        setPhase(3); // 3: Move symbols to center
        await new Promise(r => setTimeout(r, 800));
        setPhase(4); // 4: Collapse gap
        await new Promise(r => setTimeout(r, 400));
        setPhase(5); // 5: Merge into one
        await new Promise(r => setTimeout(r, 400));
        setPhase(6); // 6: Show Text
        await new Promise(r => setTimeout(r, 300));
        setPhase(7); 
      };
      sequence();
    } else {
      setPhase(0);
    }
  }, [isGameOver]);

  const handleBackToMenu = () => {
    soundService.play('click');
    resetGame();
    if (mode === 'online') {
      leaveRoom();
    }
    navigate('/');
  };

  const canInteract = !isGameOver && (mode === 'local' || mode === 'online' && engine.getCurrentSlot(gameState) === mySlot);

  const handleCellClick = (index: number) => {
    if (!canInteract || board[index] !== null) return;
    soundService.play('move');
    makeMove({ index } as TicTacToeMove);
  };

  return (
    <LayoutGroup>
      <div className="relative w-full max-w-[360px] aspect-square mx-auto">
        <div className={cn(
          "grid grid-cols-3 grid-rows-3 h-full w-full rounded-2xl overflow-hidden bg-tg-bg ring-1 ring-slate-300 dark:ring-slate-600 shadow-lg transition-all duration-500",
          isGameOver && phase >= 2 && "opacity-60 blur-[4px]"
        )}>
          {board.map((cell: any, index: number) => {
            const isWinningCell = winningLine?.includes(index);

            return (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!canInteract || (isGameOver && phase >= 2)}
                className={cn(
                  'relative flex items-center justify-center transition-all duration-300 outline-none border-slate-300 dark:border-slate-600',
                  index % 3 !== 2 && 'border-r-4',
                  index < 6 && 'border-b-4',
                  isGameOver && phase >= 2 && !isWinningCell && 'opacity-0'
                )}>

                {cell !== null && !(isWinningCell && phase >= 3) && (
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

        {/* Animation Layer */}
        {isGameOver && phase >= 3 && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="flex items-center justify-center gap-10">
              {/* Only animate winning symbols or all if draw */}
              {(status === 'won' ? winningLine : board.map((_, i) => i))?.filter(i => board[i] !== null).map((index, i, arr) => {
                const gridX = (index % 3) - 1;
                const gridY = Math.floor(index / 3) - 1;
                
                return (
                  <motion.div 
                    key={index} 
                    initial={{ x: gridX * 80, y: gridY * 80 }}
                    animate={{ 
                      x: phase >= 4 ? 0 : gridX * 80,
                      y: phase >= 4 ? 0 : gridY * 80,
                      scale: phase >= 5 ? 2.5 : 1,
                      opacity: phase >= 6 && i !== Math.floor(arr.length / 2) ? 0 : 1
                    }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute"
                  >
                    {board[index] === 0 ? <X className="text-blue-500 w-12 h-12" strokeWidth={3} /> : <Circle className="text-red-500 w-10 h-10" strokeWidth={3.5} />}
                  </motion.div>
                );
              })}
            </div>
            
            {/* Text & Buttons */}
            {phase >= 6 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center pointer-events-auto mt-48">
                <div className="text-4xl font-bold mb-8">
                  {status === 'won' ? `${winner === 0 ? 'X' : 'O'} Wins` : 'Draw'}
                </div>
                {phase >= 7 && (
                  <div className="flex flex-col gap-4 w-full px-8">
                    <Button onClick={() => { soundService.play('click'); resetGame(); }}>Play Again</Button>
                    <Button onClick={handleBackToMenu} variant="secondary">Back To Menu</Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </LayoutGroup>
  );
};
