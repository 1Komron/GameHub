import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Check, Play, Users } from 'lucide-react';
import { Button } from '../shared/ui/Button';
import { GlassCard } from '../shared/ui/GlassCard';
import { Avatar } from '../shared/ui/Avatar';
import { TelegramBottomSpacer } from '../shared/ui/TelegramBottomSpacer';
import { OpponentsModal } from '../widgets/recent-opponents/OpponentsModal';
import { useRoomStore } from '../entities/room/model/store';
import { useSettingsStore } from '../entities/settings/model/store';
import { t } from '../shared/i18n';
import { soundService } from '../shared/lib/sound';

export const Lobby: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { room, mySlot, startMatch, leaveRoom, error, isCreator, matchId } = useRoomStore();
  const { animationsEnabled } = useSettingsStore();
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get mode from search params
  const searchParams = new URLSearchParams(window.location.search);
  const mode = searchParams.get('mode') || 'classic';
  
  // Redirect if no room
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!room && code) {
        navigate('/');
      }
    }, 500); 
    return () => clearTimeout(timer);
  }, [room, code, navigate]);

  useEffect(() => {
    if (room?.status === 'finished') {
      navigate('/');
    }
  }, [room?.status, navigate]);

  // Navigate to play when match starts
  useEffect(() => {
    if (room?.status === 'in-progress') {
      soundService.play('notification');
      navigate(`/play/online/${room.code}?mode=${mode}`);
    }
  }, [room?.status, room?.code, navigate, mode]);

  if (!room) return null;
  const me = room.players.find((p) => p.slot === mySlot);
  const isReady = me?.ready || false;

  const canStart = isCreator && room.players.length === 2 && room.players.every(p => p.ready === true);

  const handleCopy = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReady = () => {
    soundService.play('click');
    useRoomStore.getState().setReady(true);
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
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full bg-tg-secondary/30 h-screen overflow-hidden" style={{ overscrollBehavior: 'none' }}>
      <main className="flex-1 flex flex-col justify-center p-4 sm:p-6 gap-6">
        <OpponentsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentMatchId={matchId ?? ''} />

        {error && (
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        <GlassCard className="flex flex-col p-8">
          <span className="text-sm text-tg-hint uppercase tracking-wider mb-2 text-center">
            {t('lobby.roomCode')}
          </span>
          <div
            className="flex items-center justify-center gap-3 bg-tg-bg px-6 py-3 rounded-2xl cursor-pointer hover:bg-tg-secondary transition-colors mb-4"
            onClick={handleCopy}>
            
            <span className="text-4xl font-mono font-bold tracking-widest text-tg-text">
              {room.code}
            </span>
            {copied ?
            <Check className="text-green-500" /> :
            <Copy className="text-tg-hint" />
            }
          </div>
          <div className="relative flex items-center justify-center mb-2">
            <span className="text-sm text-tg-hint">
              Game: <span className="font-bold text-tg-text">{room.gameId?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsModalOpen(true)}
              className="absolute right-0"
            >
              <Users size={20} />
            </Button>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-3">
          {room.players.map((player) =>
          <motion.div
            key={player.id}
            initial={animationsEnabled ? { opacity: 0, x: -20 } : false}
            animate={{ opacity: 1, x: 0 }}>
              <GlassCard className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar
                  src={player.photoUrl}
                  fallback={player.name.charAt(0)}
                  size="md" />
                  <div className="min-w-0">
                    <p className="font-bold text-tg-text truncate">
                      {player.name} {player.id === me?.id && '(You)'}
                    </p>
                    <p className="text-xs text-tg-hint truncate">
                      {player.isHost ? 'Host' : 'Guest'} {player.ready ? '✓ Ready' : ''}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${player.slot === 0 ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
                  {player.slot === 0 ? 'X' : 'O'}
                </span>
              </GlassCard>
            </motion.div>
          )}

          {room.players.length < 2 &&
          <motion.div
            initial={animationsEnabled ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center p-8 border-2 border-dashed border-tg-hint/30 rounded-2xl">
              <div className="flex flex-col items-center gap-2 text-tg-hint">
                <div className="w-8 h-8 rounded-full border-2 border-t-tg-primary animate-spin" />
                <p>{t('lobby.waiting')}</p>
              </div>
            </motion.div>
          }
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {(() => {
            const getActionButtonState = () => {
              if (!isReady) {
                return { label: 'Ready!', disabled: false, onClick: handleReady };
              }
              if (isCreator && canStart) {
                return { label: 'Start Game!', disabled: false, onClick: handleStart };
              }
              return { label: 'Waiting for players...', disabled: true, onClick: undefined };
            };
            const actionState = getActionButtonState();
            return (
              <Button
                size="lg"
                fullWidth
                disabled={actionState.disabled}
                onClick={actionState.onClick}
                className={actionState.disabled ? 'bg-tg-secondary text-tg-hint' : ''}
              >
                {actionState.label}
              </Button>
            );
          })()}
          <Button
            variant="ghost"
            fullWidth
            onClick={handleLeave}
            className="text-red-500">
            {t('lobby.leaveRoom')}
          </Button>
        </div>
        <TelegramBottomSpacer />
      </main>
    </div>);
};
