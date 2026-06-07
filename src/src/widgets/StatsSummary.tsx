import React from 'react';
import { useStatisticsStore } from '../entities/statistics/model/store';
import { GlassCard } from '../shared/ui/GlassCard';
import { t } from '../shared/i18n';
export const StatsSummary: React.FC = () => {
  const { games } = useStatisticsStore();
  let wins = 0;
  let losses = 0;
  let draws = 0;
  Object.values(games).forEach((stats) => {
    wins += stats.wins;
    losses += stats.losses;
    draws += stats.draws;
  });
  return (
    <div className="grid grid-cols-3 gap-3">
      <GlassCard className="flex flex-col items-center justify-center p-3 text-center">
        <span className="text-xs text-tg-hint uppercase font-semibold tracking-wider mb-1">
          {t('home.wins')}
        </span>
        <span className="text-2xl font-bold text-green-500">{wins}</span>
      </GlassCard>

      <GlassCard className="flex flex-col items-center justify-center p-3 text-center">
        <span className="text-xs text-tg-hint uppercase font-semibold tracking-wider mb-1">
          {t('home.draws')}
        </span>
        <span className="text-2xl font-bold text-yellow-500">{draws}</span>
      </GlassCard>

      <GlassCard className="flex flex-col items-center justify-center p-3 text-center">
        <span className="text-xs text-tg-hint uppercase font-semibold tracking-wider mb-1">
          {t('home.losses')}
        </span>
        <span className="text-2xl font-bold text-red-500">{losses}</span>
      </GlassCard>
    </div>);

};