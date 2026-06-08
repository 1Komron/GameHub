import React, { useEffect, useState } from 'react';
import { init, miniApp, themeParams, initData } from '@telegram-apps/sdk-react';
import { swipeBehavior } from '@telegram-apps/sdk';
import { useUserStore } from '../../entities/user/model/store';
interface TelegramProviderProps {
  children: React.ReactNode;
}
export const TelegramProvider: React.FC<TelegramProviderProps> = ({
  children
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setUser } = useUserStore();
  useEffect(() => {
    const initTelegram = async () => {
      try {
        // Attempt to initialize the Telegram SDK
        init();

        // If successful, mount necessary components
        if (miniApp.mountSync.isAvailable()) {
          miniApp.mountSync();
          miniApp.ready();
          miniApp.setBackgroundColor(themeParams.backgroundColor() || '#ffffff');
          miniApp.setHeaderColor(themeParams.backgroundColor() || '#ffffff');
          console.log('[DEBUG] miniApp mounted');
        } else {
          console.log('[DEBUG] miniApp NOT mountable');
        }
        
        if (swipeBehavior.mount.isAvailable()) {
            swipeBehavior.mount();
            const supported = swipeBehavior.disableVertical.isAvailable();
            console.log('[DEBUG] swipeBehavior mounted, disableVertical supported:', supported);
            if (supported) {
                swipeBehavior.disableVertical();
                console.log('[DEBUG] swipeBehavior.disableVertical() called');
            }
        } else {
            console.log('[DEBUG] swipeBehavior NOT mountable');
        }

        if (themeParams.mount.isAvailable()) {
          themeParams.mount();
          themeParams.bindCssVars();
        }
        // Get user data
        const user = initData.user();
        if (user) {
          setUser(
            {
              id: user.id,
              firstName: user.first_name,
              lastName: user.last_name,
              username: user.username,
              languageCode: user.language_code,
              isPremium: user.is_premium,
              photoUrl: user.photo_url
            },
            false
          );
        } else {
          throw new Error('No user data available');
        }
      } catch (error) {
        console.error(
          '[DIAG] Telegram init failed',
          error
        );
        console.error(
          '[DIAG] stack',
          error instanceof Error ? error.stack : error
        );
        // Fallback for web preview / outside Telegram
        setUser(
          {
            id: 1,
            firstName: 'Guest',
            lastName: 'Player',
            username: 'guest_player'
          },
          true
        );
        // Apply default theme variables manually if not in Telegram
        document.documentElement.style.setProperty(
          '--tg-theme-bg-color',
          '#ffffff'
        );
        document.documentElement.style.setProperty(
          '--tg-theme-text-color',
          '#000000'
        );
        document.documentElement.style.setProperty(
          '--tg-theme-hint-color',
          '#999999'
        );
        document.documentElement.style.setProperty(
          '--tg-theme-link-color',
          '#2481cc'
        );
        document.documentElement.style.setProperty(
          '--tg-theme-button-color',
          '#2481cc'
        );
        document.documentElement.style.setProperty(
          '--tg-theme-button-text-color',
          '#ffffff'
        );
        document.documentElement.style.setProperty(
          '--tg-theme-secondary-bg-color',
          '#f0f0f0'
        );
        // Check for dark mode preference
        if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
        {
          document.documentElement.classList.add('dark');
          document.documentElement.style.setProperty(
            '--tg-theme-bg-color',
            '#18181b'
          );
          document.documentElement.style.setProperty(
            '--tg-theme-text-color',
            '#ffffff'
          );
          document.documentElement.style.setProperty(
            '--tg-theme-secondary-bg-color',
            '#27272a'
          );
        }
      } finally {
        setIsInitialized(true);
      }
    };
    initTelegram();
  }, [setUser]);
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-tg-bg text-tg-text">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-tg-primary border-t-transparent"></div>
      </div>);

  }
  return <>{children}</>;
};