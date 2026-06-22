import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '../shared/ui/Header';
import { Play, BarChart2, Settings as SettingsIcon, Lock } from 'lucide-react';
import { UserCard } from '../shared/ui/UserCard';
import { Button } from '../shared/ui/Button';
import { GlassCard } from '../shared/ui/GlassCard';
import { useSettingsStore } from '../entities/settings/model/store';
import { GAME_CATALOG } from '../shared/config/games';
import { t } from '../shared/i18n';
import { soundService } from '../shared/lib/sound';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { animationsEnabled } = useSettingsStore();

  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  const handlePlay = (gameId: string) => {
    soundService.play('click');
    navigate(`/game/${gameId}/mode`);
  };
  return (
    <div className="h-full overflow-y-auto">
      <Header />
      <motion.div
        className="flex flex-col p-4 sm:p-6 max-w-md mx-auto w-full gap-6 pb-24"
        variants={animationsEnabled ? containerVariants : undefined}
        initial="hidden"
        animate="visible">
        
        <motion.div variants={animationsEnabled ? itemVariants : undefined}>
          <UserCard />
        </motion.div>

        <motion.div
          variants={animationsEnabled ? itemVariants : undefined}
          className="flex justify-between items-center px-2">
          
          <h1 className="text-2xl font-bold text-tg-text">{t('home.title')}</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/statistics')}
              className="h-10 w-10 bg-tg-secondary/50">
              
              <BarChart2 size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="h-10 w-10 bg-tg-secondary/50">
              
              <SettingsIcon size={20} />
            </Button>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          {GAME_CATALOG.map((game) =>
            <motion.div
              key={game.id}
              variants={animationsEnabled ? itemVariants : undefined}>
            
              <GlassCard className="p-0 overflow-hidden flex flex-col relative group">
                <div
                  className="h-32 w-full bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url(${game.imageUrl})`
                  }}>
                
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                    <h2 className="text-xl font-bold text-white">{game.title}</h2>
                    {!game.isPlayable &&
                      <span className="text-xs font-bold uppercase tracking-wider bg-black/50 text-white px-2 py-1 rounded backdrop-blur-sm">
                        {t('home.comingSoon')}
                      </span>
                    }
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-4 bg-tg-bg/50">
                  <p className="text-sm text-tg-hint">{game.description}</p>
                  <Button
                    fullWidth
                    onClick={() => handlePlay(game.id)}
                    disabled={!game.isPlayable}
                    style={
                      game.isPlayable ?
                      {
                        backgroundColor: game.accent,
                        color: '#fff'
                      } :
                      undefined
                    }
                    className={!game.isPlayable ? 'opacity-50' : ''}>
                  
                    {game.isPlayable ?
                      <>
                        <Play className="mr-2" size={18} />
                        {t('home.play')}
                      </> :

                      <>
                        <Lock className="mr-2" size={18} />
                        {t('home.comingSoon')}
                      </>
                    }
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
