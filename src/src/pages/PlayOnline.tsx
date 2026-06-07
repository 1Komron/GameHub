import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { GameBoard } from '../widgets/GameBoard';
import { GameResultActions } from '../widgets/GameResultActions';
import { useGameStore } from '../entities/game/model/store';
import { useRoomStore } from '../entities/room/model/store';
import { useSettingsStore } from '../entities/settings/model/store';
import { useStatisticsStore } from '../entities/statistics/model/store';
import { Button } from '../shared/ui/Button';
import { GlassCard } from '../shared/ui/GlassCard';
import { ticTacToeEngine } from '../entities/game/tic-tac-toe/engine';
import { getGameById } from '../shared/config/games';
import { soundService } from '../shared/lib/sound';
export const PlayOnline: React.FC = () => {
  const { } = useParams<{
    code: string;
  }>();
  const navigate = useNavigate();
  const { initOnline, resetGame, engine, gameState, mySlot, matchId } = useGameStore();
  const { room, mySlot: roomSlot, leaveRoom } = useRoomStore();
  const { animationsEnabled } = useSettingsStore();
  const { recordResult } = useStatisticsStore();
  const lastProcessedMatchIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!room) {
      navigate('/');
      return;
    }
    if (room.gameId === 'tic-tac-toe' && roomSlot !== null) {
      initOnline(ticTacToeEngine, roomSlot);
    }
    return () => resetGame();
  }, [room, roomSlot, initOnline, resetGame, navigate]);
  if (!engine || !gameState || !room) return null;
  const status = engine.getStatus(gameState);
  const isGameOver = status === 'won' || status === 'draw';
  const winner = status === 'won' ? engine.getWinner(gameState) : null;

  useEffect(() => {
    if (isGameOver && matchId && lastProcessedMatchIdRef.current !== matchId) {
      lastProcessedMatchIdRef.current = matchId;
      
      let result = 'draw';
      if (status === 'won') {
        result = winner === mySlot ? 'win' : 'loss';
      }
      
      if (room.gameId) {
        recordResult(room.gameId, result as any);
      }
      
      if (status === 'won') {
        soundService.play(result === 'win' ? 'win' : 'loss');
      } else {
        soundService.play('notification');
      }
    }
  }, [isGameOver, status, winner, mySlot, room.gameId, matchId, recordResult]);
  const currentSlot = engine.getCurrentSlot(gameState);
  const isMyTurn = currentSlot === mySlot;
  const gameDef = getGameById(room.gameId);
  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full">
      <header className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={handleLeave}>
          <ArrowLeft size={24} />
        </Button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold">
            {gameDef?.title || 'Online Match'}
          </h1>
          <span className="text-xs text-tg-hint font-mono">
            Room: {room.code}
          </span>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
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

          <GlassCard
            className={`flex items-center justify-center py-4 px-6 border-2 transition-colors ${isMyTurn ? 'border-tg-primary bg-tg-primary/5' : 'border-transparent'}`}>

            <div className="flex items-center gap-3">
              <span className="text-tg-hint font-medium">
                {isMyTurn ? 'Your Turn' : "Opponent's Turn"}
              </span>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-lg ${currentSlot === 0 ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>

                {currentSlot === 0 ? 'X' : 'O'}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {room.gameId === 'tic-tac-toe' && <GameBoard />}
        <GameResultActions 
          isVisible={isGameOver}
          status={status}
          winner={winner}
          mode="online"
          onPlayAgain={() => {}} 
          onBackToMenu={handleLeave}
        />
      </main>

    </div>);

  };