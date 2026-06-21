import { RecentOpponent, PageResponse } from '../../../entities/user/types';
import { authHeaders } from '../auth/authService';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://game-hub-back.duckdns.org';

export const getRecentOpponents = async (page: number, size: number): Promise<PageResponse<RecentOpponent>> => {
  const response = await fetch(`${BASE_URL}/api/users/recent-opponents?page=${page}&size=${size}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch recent opponents');
  const json = await response.json();
  return json.data;
};

export const inviteToMatch = async (matchId: string, targetUserId: number): Promise<boolean> => {
  const response = await fetch(`${BASE_URL}/api/matches/${matchId}/invite/${targetUserId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.msg || 'Failed to send invite');
  }
  return true;
};
