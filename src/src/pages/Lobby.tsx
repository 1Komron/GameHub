import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Play } from 'lucide-react';
import { Button } from '../shared/ui/Button';
import { GlassCard } from '../shared/ui/GlassCard';
import { Avatar } from '../shared/ui/Avatar';
import { useRoomStore } from '../entities/room/model/store';
import { useSettingsStore } from '../entities/settings/model/store';
import { t } from '../shared/i18n';
import { soundService } from '../shared/lib/sound';
export const Lobby: React.FC = () => {
  const { code } = useParams<{
    code: string;
  }>();
  const navigate = useNavigate();
  const { room, mySlot, startMatch, leaveRoom } = useRoomStore();
  const { animationsEnabled } = useSettingsStore();
  const [copied, setCopied] = useState(false);
  // Get mode from search params
  const searchParams = new URLSearchParams(window.location.search);
  const mode = searchParams.get('mode') || 'classic';
  // Redirect if no room
  useEffect(() => {
    if (!room && code) {
      // In a real app, we might try to join here if arriving via deep link
      navigate('/');
    }
  }, [room, code, navigate]);
  // Navigate to play when match starts
  useEffect(() => {
    if (room?.status === 'in-progress') {
      soundService.play('notification');
      navigate(`/play/online/${room.code}?mode=${mode}`);
    }
  }, [room?.status, navigate, mode]);
  if (!room) return null;
  const me = room.players.find((p) => p.slot === mySlot);
  const isHost = me?.isHost;
  const handleCopy = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleStart = () => {
    soundService.play('click');
    startMatch();
  };
  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full bg-tg-secondary/30">
      <header className="flex items-center p-4 bg-tg-bg sticky top-0 z-10 border-b border-black/5 dark:border-white/5">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLeave}
          className="mr-2">
          
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold">{t('lobby.title')}</h1>
      </header>

      <main className="flex-1 p-4 sm:p-6 flex flex-col gap-6">
        <GlassCard className="flex flex-col items-center justify-center p-8 text-center">
          <span className="text-sm text-tg-hint uppercase tracking-wider mb-2">
            {t('lobby.roomCode')}
          </span>
          <div
            className="flex items-center gap-3 bg-tg-bg px-6 py-3 rounded-2xl cursor-pointer hover:bg-tg-secondary transition-colors mb-4"
            onClick={handleCopy}>
            
            <span className="text-4xl font-mono font-bold tracking-widest text-tg-text">
              {room.code}
            </span>
            {copied ?
            <Check className="text-green-500" /> :

            <Copy className="text-tg-hint" />
            }
          </div>
          <span className="text-sm text-tg-hint">
            Current Mode: <span className="font-bold text-tg-text uppercase">{mode}</span>
          </span>
        </GlassCard>

        <div className="flex flex-col gap-3">
          {room.players.map((player) =>
          <motion.div
            key={player.id}
            initial={
            animationsEnabled ?
            {
              opacity: 0,
              x: -20
            } :
            false
            }
            animate={{
              opacity: 1,
              x: 0
            }}>
            
              <GlassCard className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Avatar
                  src={player.photoUrl}
                  fallback={player.name.charAt(0)}
                  size="md" />
                
                  <div>
                    <p className="font-bold text-tg-text">
                      {player.name} {player.id === me?.id && '(You)'}
                    </p>
                    <p className="text-xs text-tg-hint">
                      {player.isHost ? 'Host' : 'Guest'}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {room.players.length < 2 &&
          <motion.div
            initial={
            animationsEnabled ?
            {
              opacity: 0
            } :
            false
            }
            animate={{
              opacity: 1
            }}
            className="flex items-center justify-center p-8 border-2 border-dashed border-tg-hint/30 rounded-2xl">
            
              <div className="flex flex-col items-center gap-2 text-tg-hint">
                <div className="w-8 h-8 rounded-full border-2 border-t-tg-primary animate-spin" />
                <p>{t('lobby.waiting')}</p>
              </div>
            </motion.div>
          }
        </div>

        <div className="mt-auto pt-6 flex flex-col gap-3">
          {isHost &&
          <Button
            size="lg"
            fullWidth
            onClick={handleStart}>
            
              <Play className="mr-2" size={20} />
              {t('lobby.startGame')}
            </Button>
          }
          <Button
            variant="ghost"
            fullWidth
            onClick={handleLeave}
            className="text-red-500">
            
            {t('lobby.leaveRoom')}
          </Button>
        </div>
      </main>
    </div>);

};