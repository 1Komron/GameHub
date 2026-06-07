import { create } from 'zustand';

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
  photoUrl?: string;
}

interface UserState {
  user: TelegramUser | null;
  isMock: boolean;
  setUser: (user: TelegramUser, isMock?: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isMock: false,
  setUser: (user, isMock = false) => set({ user, isMock })
}));