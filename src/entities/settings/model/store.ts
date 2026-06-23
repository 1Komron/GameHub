import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '../../../shared/i18n';

const getDefaultAnimationsEnabled = () => {
  if (typeof navigator === 'undefined') return true;
  return !/Android/i.test(navigator.userAgent);
};

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
      animationsEnabled: getDefaultAnimationsEnabled(),
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