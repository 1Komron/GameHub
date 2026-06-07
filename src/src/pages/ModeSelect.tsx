import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Globe, Plus, LogIn, Play } from 'lucide-react';
import { Button } from '../shared/ui/Button';
import { GlassCard } from '../shared/ui/GlassCard';
import { useSettingsStore } from '../entities/settings/model/store';
import { useRoomStore } from '../entities/room/model/store';
import { useUserStore } from '../entities/user/model/store';
import { getGameById } from '../shared/config/games';
import { t } from '../shared/i18n';
import { soundService } from '../shared/lib/sound';
export const ModeSelect: React.FC = () => {
  const { gameId } = useParams<{
    gameId: string;
  }>();
  const navigate = useNavigate();
  const { animationsEnabled } = useSettingsStore();
  const { createRoom, joinRoom, connect, isConnecting, error, clearError } =
  useRoomStore();
  const { user } = useUserStore();
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const game = getGameById(gameId || '');
  if (!game) {
    return <div className="p-4">Game not found</div>;
  }
  const handleLocalPlay = () => {
    soundService.play('click');
    navigate(`/play/local/${gameId}`);
  };
  const handleCreateRoom = async () => {
    soundService.play('click');
    if (user) {
      connect({
        id: String(user.id),
        name: user.firstName,
        photoUrl: user.photoUrl
      });
    }
    await createRoom(gameId as any);
    const room = useRoomStore.getState().room;
    if (room) {
      navigate(`/lobby/${room.code}`);
    }
  };
  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    soundService.play('click');
    if (user) {
      connect({
        id: String(user.id),
        name: user.firstName,
        photoUrl: user.photoUrl
      });
    }
    await joinRoom(joinCode.trim().toUpperCase());
    const room = useRoomStore.getState().room;
    if (room) {
      navigate(`/lobby/${room.code}`);
    }
  };
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full bg-tg-secondary/30">
      <header className="flex items-center p-4 bg-tg-bg sticky top-0 z-10 border-b border-black/5 dark:border-white/5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="mr-2">
          
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-xl font-bold">{t('mode.title')}</h1>
      </header>

      <main className="flex-1 p-4 sm:p-6 flex flex-col gap-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-tg-text mb-2">{game.title}</h2>
        </div>

        <motion.div
          initial={
          animationsEnabled ?
          {
            opacity: 0,
            y: 20
          } :
          false
          }
          animate={{
            opacity: 1,
            y: 0
          }}>
          
          <GlassCard className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                <Users size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-tg-text">
                  {t('mode.local')}
                </h3>
                <p className="text-sm text-tg-hint">{t('mode.localDesc')}</p>
              </div>
            </div>
            <Button size="lg" fullWidth onClick={handleLocalPlay}>
              <Play className="mr-2" size={20} />
              {t('home.play')}
            </Button>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={
          animationsEnabled ?
          {
            opacity: 0,
            y: 20
          } :
          false
          }
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.1
          }}>
          
          <GlassCard className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                <Globe size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-tg-text">
                  {t('mode.online')}
                </h3>
                <p className="text-sm text-tg-hint">{t('mode.onlineDesc')}</p>
              </div>
            </div>

            {error &&
            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm flex justify-between items-center">
                <span>{error}</span>
                <button onClick={clearError} className="text-red-500 font-bold">
                  ×
                </button>
              </div>
            }

            <div className="flex flex-col gap-3">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleCreateRoom}
                disabled={isConnecting}>
                
                <Plus className="mr-2" size={20} />
                {t('mode.createRoom')}
              </Button>

              {!showJoinInput ?
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => setShowJoinInput(true)}>
                
                  <LogIn className="mr-2" size={20} />
                  {t('mode.joinRoom')}
                </Button> :

              <div className="flex gap-2">
                  <input
                  type="text"
                  placeholder={t('mode.enterCode')}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-tg-bg border border-tg-hint/30 rounded-xl px-4 uppercase text-center font-mono tracking-widest focus:outline-none focus:border-tg-primary"
                  maxLength={7} />
                
                  <Button
                  onClick={handleJoinRoom}
                  disabled={!joinCode || isConnecting}>
                  
                    {t('mode.joinRoom')}
                  </Button>
                </div>
              }
            </div>
          </GlassCard>
        </motion.div>
      </main>
    </div>);

};