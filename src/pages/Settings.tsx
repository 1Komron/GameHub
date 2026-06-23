import React from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  Sparkles,
  Palette,
  Info,
  Globe } from
'lucide-react';
import { useSettingsStore } from '../entities/settings/model/store';
import { Header } from '../shared/ui/Header';
import { Toggle } from '../shared/ui/Toggle';
import { GlassCard } from '../shared/ui/GlassCard';
import { t } from '../shared/i18n';
export const Settings: React.FC = () => {
  const {
    soundEnabled,
    animationsEnabled,
    language,
    toggleSound,
    toggleAnimations,
    setLanguage
  } = useSettingsStore();

  console.log('[SettingsDebug]', { animationsEnabled, soundEnabled, timestamp: Date.now() });

  const containerVariants = (enabled: boolean) => ({
    hidden: { opacity: enabled ? 0 : 1 },
    visible: { opacity: 1, transition: { staggerChildren: enabled ? 0.1 : 0, duration: enabled ? undefined : 0 } }
  });
  const itemVariants = (enabled: boolean) => ({
    hidden: { opacity: enabled ? 0 : 1, y: enabled ? 10 : 0 },
    visible: { opacity: 1, y: 0, transition: { duration: enabled ? undefined : 0 } }
  });

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full bg-tg-secondary/30">
      <Header />
      <motion.main
        className="flex-1 p-4 sm:p-6 flex flex-col gap-6"
        variants={containerVariants(animationsEnabled)}
        initial="hidden"
        animate="visible">
        
        <motion.div variants={itemVariants(animationsEnabled)}>
          <GlassCard className="flex flex-col p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg flex-shrink-0">
                  <Volume2 size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-tg-text truncate">
                    {t('settings.sound')}
                  </p>
                </div>
              </div>
              <Toggle checked={soundEnabled} onChange={toggleSound} />
            </div>

            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg flex-shrink-0">
                  <Sparkles size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-tg-text truncate">
                    {t('settings.animations')}
                  </p>
                </div>
              </div>
              <Toggle checked={animationsEnabled} onChange={toggleAnimations} />
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-green-500/10 text-green-500 rounded-lg flex-shrink-0">
                  <Globe size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-tg-text truncate">
                    {t('settings.language')}
                  </p>
                </div>
              </div>
              <div className="flex bg-tg-secondary rounded-lg p-1 flex-shrink-0">
                <button
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === 'en' ? 'bg-tg-bg shadow-sm' : 'text-tg-hint'}`}
                  onClick={() => setLanguage('en')}>
                  
                  EN
                </button>
                <button
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === 'ru' ? 'bg-tg-bg shadow-sm' : 'text-tg-hint'}`}
                  onClick={() => setLanguage('ru')}>
                  
                  RU
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants(animationsEnabled)}>
          <GlassCard className="flex flex-col p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg flex-shrink-0">
                  <Palette size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-tg-text truncate">
                    {t('settings.theme')}
                  </p>
                  <p className="text-xs text-tg-hint truncate">Synced with Telegram</p>
                </div>
              </div>
              <span className="text-sm font-medium text-tg-primary bg-tg-primary/10 px-3 py-1 rounded-full flex-shrink-0">
                Auto
              </span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants(animationsEnabled)}>
          <GlassCard className="flex flex-col p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-gray-500/10 text-gray-500 rounded-lg flex-shrink-0">
                  <Info size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-tg-text truncate">Version</p>
                  <p className="text-xs text-tg-hint truncate">Game Hub Mini App</p>
                </div>
              </div>
              <span className="text-sm text-tg-hint flex-shrink-0">v2.0.0</span>
            </div>
          </GlassCard>
        </motion.div>
      </motion.main>
    </div>);

};