import React, {useEffect, useState} from 'react';
import {init, miniApp, themeParams, retrieveLaunchParams} from '@telegram-apps/sdk-react';
import {swipeBehavior} from '@telegram-apps/sdk';
import {useUserStore} from '../../entities/user/model/store';
import {loginWithTelegram} from '../../shared/api/auth/authService';

interface TelegramWebApp {
    initData?: string;
    initDataUnsafe?: {
        user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
        };
    };
}

interface TelegramProviderProps {
    children: React.ReactNode;
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const {setUser} = useUserStore();
    useEffect(() => {
        const initTelegram = async () => {
            try {
                // Initialize SDK
                init();

                // Retrieve launch params from hash URL
                const lp = retrieveLaunchParams();
                console.log('[DIAG] LP', lp);
                console.log('[DIAG] LP.initData', lp.initData);
                console.log('[DIAG] LP.initDataRaw', lp.initDataRaw);

                // If successful, mount necessary components
                if (miniApp.mountSync.isAvailable()) {
                    miniApp.mountSync();
                    miniApp.ready();
                    miniApp.setBackgroundColor(themeParams.backgroundColor() || '#ffffff');
                    miniApp.setHeaderColor(themeParams.backgroundColor() || '#ffffff');
                }

                if (swipeBehavior.mount.isAvailable()) {
                    swipeBehavior.mount();
                    if (swipeBehavior.disableVertical.isAvailable()) {
                        swipeBehavior.disableVertical();
                    }
                }

                if (themeParams.mountSync.isAvailable()) {
                    themeParams.mountSync();
                    themeParams.bindCssVars();
                }

                // Use lp.initData for user
                // The type of initData in lp is complex. Accessing user safely.
                const initData = (lp as { initData?: { user?: { 
                    id: number, 
                    first_name: string, 
                    last_name?: string, 
                    username?: string, 
                    language_code?: string, 
                    is_premium?: boolean, 
                    photo_url?: string 
                } } }).initData;

                // Fallback: parse user from window.Telegram.WebApp.initDataUnsafe
                const tgWebApp = (window as Window & { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
                const user = initData?.user ?? tgWebApp?.initDataUnsafe?.user;

                // Improved retrieval of initDataRaw
                const initDataRaw = lp.initDataRaw 
                    ?? tgWebApp?.initData 
                    ?? (import.meta.env.DEV ? import.meta.env.VITE_DEV_INIT_DATA : undefined);

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

                    if (initDataRaw) {
                        await loginWithTelegram(initDataRaw);
                    } else {
                        // eslint-disable-next-line no-console
                        console.warn('[AUTH] initDataRaw not available, skipping Telegram auth');
                    }
                } else {
                    // eslint-disable-next-line no-console
                    console.warn('[AUTH] No user data available, skipping Telegram auth');
                }
            } catch (error) {
                console.error('[DIAG] Telegram init failed', error);

                // Fallback for web preview / outside Telegram (only if explicitly desired or for testing)
                // If you want to force guest login in dev, you might keep this.
                // Based on instructions, we want to avoid 400s.
                // Assuming we still want to set a guest user without calling loginWithTelegram (or with mock data)
                
                setUser(
                    {
                        id: 1,
                        firstName: 'Guest',
                        lastName: 'Player',
                        username: 'guest_player'
                    },
                    true
                );
                
                // If we absolutely need to call loginWithTelegram here, wrap it in try/catch or check initData
                // The original code was doing it unconditionally.
                // Let's comment it out to stop 400s if it's failing.
                /*
                const mockId = Math.floor(Math.random() * 900000000) + 100000000;
                await loginWithTelegram(`user=%7B%22id%22%3A${mockId}%2C%22first_name%22%3A%22Guest%22%2C%22username%22%3A%22guest_${mockId}%22%7D&hash=test`);
                */

                // Apply default theme variables manually if not in Telegram
                document.documentElement.style.setProperty('--tg-theme-bg-color', '#ffffff');
                document.documentElement.style.setProperty('--tg-theme-text-color', '#000000');
                document.documentElement.style.setProperty('--tg-theme-hint-color', '#999999');
                document.documentElement.style.setProperty('--tg-theme-link-color', '#2481cc');
                document.documentElement.style.setProperty('--tg-theme-button-color', '#2481cc');
                document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff');
                document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#f0f0f0');
                
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.setProperty('--tg-theme-bg-color', '#18181b');
                    document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff');
                    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', '#27272a');
                }
            } finally {
                setIsInitialized(true);
            }
        };
        initTelegram().catch(console.error);
    }, [setUser]);
    
    if (!isInitialized) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-tg-bg text-tg-text">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-tg-primary border-t-transparent"></div>
            </div>);
    }
    return <>{children}</>;
};
