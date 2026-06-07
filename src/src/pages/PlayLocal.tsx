import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { GameBoard } from '../widgets/GameBoard';
import { GameOverModal } from '../widgets/GameOverModal';
import { useGameStore } from '../entities/game/model/store';
import { useSettingsStore } from '../entities/settings/model/store';
import { Button } from '../shared/ui/Button';
import { GlassCard } from '../shared/ui/GlassCard';
import { ticTacToeEngine } from '../entities/game/tic-tac-toe/engine';
import { getGameById } from '../shared/config/games';
import { soundService } from '../shared/lib/sound';
export const PlayLocal: React.FC = () => {
  const { gameId } = useParams<{
    gameId: string;
  }>();
  // Simplified mode detection from URL or state
  const searchParams = new URLSearchParams(window.location.search);
  const mode = (searchParams.get('mode') as 'classic' | 'shift') || 'classic';
  const navigate = useNavigate();
  const { initLocal, resetGame, engine, gameState } = useGameStore();
  const { animationsEnabled } = useSettingsStore();
  const gameDef = getGameById(gameId || '');
  useEffect(() => {
    // Currently only TTT is implemented
    if (gameId === 'tic-tac-toe') {
      initLocal(ticTacToeEngine, mode);
    }
    return () => resetGame();
  }, [gameId, initLocal, resetGame, mode]);
  if (!engine || !gameState) return null;
  const currentSlot = engine.getCurrentSlot(gameState);
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full">
      <header className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold">{gameDef?.title || 'Local Match'}</h1>
        <Button variant="ghost" size="icon" onClick={() => {
          soundService.play('click');
          resetGame();
        }}>
          <RotateCcw size={24} />
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <motion.div
          initial={
          animationsEnabled ?
          {
            opacity: 0,
            y: -20
          } :
          false
          }
          animate={{
            opacity: 1,
            y: 0
          }}
          className="w-full">
          
          <GlassCard className="flex items-center justify-center py-4 px-6">
            <div className="flex items-center gap-3">
              <span className="text-tg-hint font-medium">Current Turn:</span>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-lg ${currentSlot === 0 ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
                
                {currentSlot === 0 ? 'X' : 'O'}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {gameId === 'tic-tac-toe' && <GameBoard />}
      </main>

      <GameOverModal />
    </div>);

};