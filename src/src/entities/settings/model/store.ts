import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '../../../shared/i18n';

interface SettingsState {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  language: Language;

  toggleSound: () => void;
  toggleAnimations: () => void;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      animationsEnabled: true,
      language: 'en',

      toggleSound: () =>
      set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleAnimations: () =>
      set((state) => ({ animationsEnabled: !state.animationsEnabled })),
      setLanguage: (language) => set({ language })
    }),
    {
      name: 'gamehub-settings'
    }
  )
);