import React from 'react';
import { useUserStore } from '../entities/user/model/store';
import { useStatisticsStore } from '../entities/statistics/model/store';
import { GlassCard } from '../shared/ui/GlassCard';
import { Avatar } from '../shared/ui/Avatar';
import { t } from '../shared/i18n';
export const UserCard: React.FC = () => {
  const { user, isMock } = useUserStore();
  const { totalGames } = useStatisticsStore();
  if (!user) return null;
  const initials = user.firstName.charAt(0) + (user.lastName?.charAt(0) || '');
  return (
    <GlassCard className="flex items-center gap-4 p-4">
      <Avatar src={user.photoUrl} fallback={initials} size="lg" />
      <div className="flex flex-col flex-1">
        <h2 className="text-xl font-bold text-tg-text">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-sm text-tg-hint">
          {user.username ? `@${user.username}` : 'Telegram User'}
          {isMock && ' (Preview)'}
        </p>
      </div>
      <div className="flex flex-col items-end justify-center">
        <span className="text-2xl font-bold text-tg-primary">{totalGames}</span>
        <span className="text-xs text-tg-hint font-medium uppercase tracking-wider">
          {t('home.gamesPlayed')}
        </span>
      </div>
    </GlassCard>);

};