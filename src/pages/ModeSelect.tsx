import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Globe, Plus, LogIn, Play } from 'lucide-react';
import { Button } from '../shared/ui/Button';
import { GlassCard } from '../shared/ui/GlassCard';
import { TelegramBottomSpacer } from '../shared/ui/TelegramBottomSpacer';
import { useSettingsStore } from '../entities/settings/model/store';
import { useRoomStore } from '../entities/room/model/store';
import { useUserStore } from '../entities/user/model/store';
import { GameId } from '../entities/game-engine/types';
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
  const [onlineVariant, setOnlineVariant] = useState<'classic' | 'shift'>('classic');
  const game = getGameById(gameId || '');
  if (!game) {
    return <div className="p-4">Game not found</div>;
  }
  const handleLocalPlay = (mode: 'classic' | 'shift') => {
    soundService.play('click');
    navigate(`/play/local/${gameId}?mode=${mode}`);
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
    const effectiveGameId = onlineVariant === 'shift' 
      ? `${gameId}-shift` 
      : gameId;
    await createRoom(effectiveGameId as GameId);
    const { room, matchId } = useRoomStore.getState();
    if (room && matchId) {
      navigate(`/lobby/${matchId}?mode=${onlineVariant}`);
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
    const { room, matchId } = useRoomStore.getState();
    if (room && matchId) {
      navigate(`/lobby/${matchId}`);
    }
  };
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full bg-tg-secondary/30">
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
              {/* Variant selector */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setOnlineVariant('classic')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                    onlineVariant === 'classic' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white/5 text-tg-hint'
                  }`}
                >
                  Classic
                </button>
                <button
                  onClick={() => setOnlineVariant('shift')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                    onlineVariant === 'shift' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/5 text-tg-hint'
                  }`}
                >
                  Shift
                </button>
              </div>

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

              <div className="flex items-center gap-2 w-full mt-3">
                  <input
                  type="text"
                  placeholder={t('mode.enterCode')}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="flex-1 min-w-0 w-full px-4 py-3 bg-slate-950/40 border border-white/10 rounded-2xl text-sm uppercase text-center font-mono tracking-widest focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-500"
                  maxLength={7} />
                
                  <button
                  onClick={handleJoinRoom}
                  disabled={!joinCode || isConnecting}
                  className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-2xl shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all duration-200">
                  
                    {t('mode.joinRoom')}
                  </button>
                </div>
              }
            </div>
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
            <div className="flex flex-col gap-2">
              <Button size="lg" fullWidth onClick={() => handleLocalPlay('classic')}>
                <Play className="mr-2" size={20} />
                {t('mode.localClassic')}
              </Button>
              <Button size="lg" fullWidth onClick={() => handleLocalPlay('shift')} className="bg-purple-600">
                <Play className="mr-2" size={20} />
                {t('mode.localShift')}
              </Button>
            </div>
          </GlassCard>
        </motion.div>
        <TelegramBottomSpacer />
      </main>
    </div>);

};