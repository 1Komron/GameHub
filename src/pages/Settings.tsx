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
      y: 10
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto w-full bg-tg-secondary/30">
      <motion.main
        className="flex-1 p-4 sm:p-6 flex flex-col gap-6"
        variants={animationsEnabled ? containerVariants : undefined}
        initial="hidden"
        animate="visible">
        
        <motion.div variants={animationsEnabled ? itemVariants : undefined}>
          <GlassCard className="flex flex-col p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                  <Volume2 size={20} />
                </div>
                <div>
                  <p className="font-medium text-tg-text">
                    {t('settings.sound')}
                  </p>
                </div>
              </div>
              <Toggle checked={soundEnabled} onChange={toggleSound} />
            </div>

            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="font-medium text-tg-text">
                    {t('settings.animations')}
                  </p>
                </div>
              </div>
              <Toggle checked={animationsEnabled} onChange={toggleAnimations} />
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="font-medium text-tg-text">
                    {t('settings.language')}
                  </p>
                </div>
              </div>
              <div className="flex bg-tg-secondary rounded-lg p-1">
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

        <motion.div variants={animationsEnabled ? itemVariants : undefined}>
          <GlassCard className="flex flex-col p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                  <Palette size={20} />
                </div>
                <div>
                  <p className="font-medium text-tg-text">
                    {t('settings.theme')}
                  </p>
                  <p className="text-xs text-tg-hint">Synced with Telegram</p>
                </div>
              </div>
              <span className="text-sm font-medium text-tg-primary bg-tg-primary/10 px-3 py-1 rounded-full">
                Auto
              </span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={animationsEnabled ? itemVariants : undefined}>
          <GlassCard className="flex flex-col p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-500/10 text-gray-500 rounded-lg">
                  <Info size={20} />
                </div>
                <div>
                  <p className="font-medium text-tg-text">Version</p>
                  <p className="text-xs text-tg-hint">Game Hub Mini App</p>
                </div>
              </div>
              <span className="text-sm text-tg-hint">v2.0.0</span>
            </div>
          </GlassCard>
        </motion.div>
      </motion.main>
    </div>);

};