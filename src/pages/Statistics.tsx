import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Frown,
  Minus,
  Hash,
  Trash2,
  Star } from
'lucide-react';
import { useStatisticsStore } from '../entities/statistics/model/store';
import { useSettingsStore } from '../entities/settings/model/store';
import { Button } from '../shared/ui/Button';
import { GlassCard } from '../shared/ui/GlassCard';
import { getGameById } from '../shared/config/games';
import { t } from '../shared/i18n';
export const Statistics: React.FC = () => {
  const { games, totalGames, favoriteGame, resetStats } = useStatisticsStore();
  const { animationsEnabled } = useSettingsStore();
  const favGameDef = favoriteGame ? getGameById(favoriteGame) : null;
  // Aggregate totals
  let totalWins = 0;
  let totalLosses = 0;
  let totalDraws = 0;
  Object.values(games).forEach((stats) => {
    totalWins += stats.wins;
    totalLosses += stats.losses;
    totalDraws += stats.draws;
  });
  const winRate =
  totalGames > 0 ? Math.round(totalWins / totalGames * 100) : 0;
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
      x: -20
    },
    visible: {
      opacity: 1,
      x: 0
    }
  };
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full bg-tg-secondary/30">
      <motion.main
        className="flex-1 p-4 sm:p-6 flex flex-col gap-4"
        variants={animationsEnabled ? containerVariants : undefined}
        initial="hidden"
        animate="visible">
        
        <motion.div variants={animationsEnabled ? itemVariants : undefined}>
          <GlassCard className="bg-tg-primary text-tg-primary-text border-none flex flex-col items-center justify-center p-8 mb-4">
            <span className="text-tg-primary-text/80 font-medium mb-1">
              Win Rate
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold">{winRate}</span>
              <span className="text-2xl font-semibold">%</span>
            </div>
          </GlassCard>
        </motion.div>

        {favGameDef &&
        <motion.div variants={animationsEnabled ? itemVariants : undefined}>
            <GlassCard className="flex items-center gap-4 p-4 mb-2">
              <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
                <Star size={24} />
              </div>
              <div>
                <p className="text-sm text-tg-hint">
                  {t('stats.favoriteGame')}
                </p>
                <p className="font-bold text-tg-text">{favGameDef.title}</p>
              </div>
            </GlassCard>
          </motion.div>
        }

        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={animationsEnabled ? itemVariants : undefined}>
            <GlassCard className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-green-500">
                <Trophy size={20} />
                <span className="font-semibold">{t('home.wins')}</span>
              </div>
              <span className="text-3xl font-bold text-tg-text">
                {totalWins}
              </span>
            </GlassCard>
          </motion.div>

          <motion.div variants={animationsEnabled ? itemVariants : undefined}>
            <GlassCard className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-500">
                <Frown size={20} />
                <span className="font-semibold">{t('home.losses')}</span>
              </div>
              <span className="text-3xl font-bold text-tg-text">
                {totalLosses}
              </span>
            </GlassCard>
          </motion.div>

          <motion.div variants={animationsEnabled ? itemVariants : undefined}>
            <GlassCard className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-yellow-500">
                <Minus size={20} />
                <span className="font-semibold">{t('home.draws')}</span>
              </div>
              <span className="text-3xl font-bold text-tg-text">
                {totalDraws}
              </span>
            </GlassCard>
          </motion.div>

          <motion.div variants={animationsEnabled ? itemVariants : undefined}>
            <GlassCard className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-500">
                <Hash size={20} />
                <span className="font-semibold">{t('stats.totalGames')}</span>
              </div>
              <span className="text-3xl font-bold text-tg-text">
                {totalGames}
              </span>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div
          variants={animationsEnabled ? itemVariants : undefined}
          className="mt-auto pt-8">
          
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              if (
              window.confirm('Are you sure you want to reset all statistics?'))
              {
                resetStats();
              }
            }}
            className="text-red-500 border-red-500/30 hover:bg-red-500/10">
            
            <Trash2 className="mr-2" size={20} />
            {t('stats.reset')}
          </Button>
        </motion.div>
      </motion.main>
    </div>);

};