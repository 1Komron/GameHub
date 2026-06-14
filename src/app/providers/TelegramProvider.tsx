import React, {useEffect, useState} from 'react';
import {init, miniApp, themeParams, retrieveLaunchParams} from '@telegram-apps/sdk-react';
import {swipeBehavior} from '@telegram-apps/sdk';
import {useUserStore} from '../../entities/user/model/store';
import {loginWithTelegram} from '../../shared/api/auth/authService';

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

                // Попытка 1: из SDK
                let initDataRaw = lp.initDataRaw;

                // Попытка 2: из window.Telegram.WebApp
                if (!initDataRaw) {
                    const tgWebApp = (window as Window & { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp;
                    if (tgWebApp?.initData) {
                        initDataRaw = tgWebApp.initData;
                    }
                }

                // Попытка 3: вручную из URL hash (работает на платформе 'web')
                if (!initDataRaw) {
                    const hash = window.location.hash.slice(1);
                    const prefix = 'tgWebAppData=';
                    const startIdx = hash.indexOf(prefix);
                    if (startIdx !== -1) {
                        const afterPrefix = hash.slice(startIdx + prefix.length);
                        // tgWebAppData идёт до следующего tgWebApp параметра
                        const endMatch = afterPrefix.match(/&tgWebApp[A-Z]/);
                        initDataRaw = endMatch
                            ? afterPrefix.slice(0, endMatch.index)
                            : afterPrefix;
                    }
                }

                // DEV fallback
                if (!initDataRaw && import.meta.env.DEV) {
                    initDataRaw = import.meta.env.VITE_DEV_INIT_DATA;
                }

                // Попытка 1: из SDK
                const sdkInitData = (lp as { initData?: { user?: {
                    id: number;
                    first_name: string;
                    last_name?: string;
                    username?: string;
                    language_code?: string;
                    is_premium?: boolean;
                    photo_url?: string;
                } } }).initData;

                let user = sdkInitData?.user;

                // Попытка 2: распарсить из initDataRaw
                if (!user && typeof initDataRaw === 'string') {
                    try {
                        const parsed = new URLSearchParams(initDataRaw);
                        const userJson = parsed.get('user');
                        if (userJson) {
                            user = JSON.parse(decodeURIComponent(userJson)) as {
                                id: number;
                                first_name: string;
                                last_name?: string;
                                username?: string;
                                language_code?: string;
                                is_premium?: boolean;
                                photo_url?: string;
                            };
                        }
                    } catch {
                        // ignore parse error
                    }
                }

                // Logging for verification
                console.log('[DIAG] Final initDataRaw', initDataRaw);
                console.log('[DIAG] Final user', user);

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

                    if (typeof initDataRaw === 'string') {
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
