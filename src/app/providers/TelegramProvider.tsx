import React, {useEffect, useState, useCallback} from 'react';
import {init, miniApp, themeParams, retrieveLaunchParams} from '@telegram-apps/sdk-react';
import {swipeBehavior} from '@telegram-apps/sdk';
import {useUserStore} from '../../entities/user/model/store';
import {loginWithTelegram, getToken} from '../../shared/api/auth/authService';
import {initPresenceSocket} from '../../shared/api/presenceSocket';

interface TelegramProviderProps {
    children: React.ReactNode;
}

const LoadingScreen = () => (
    <div className="flex h-screen w-full items-center justify-center bg-tg-bg text-tg-text">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-tg-primary border-t-transparent"></div>
    </div>
);

const AuthErrorScreen = () => (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-tg-bg text-tg-text p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Failed</h1>
        <p>Please try reloading the application.</p>
    </div>
);

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
    const [authStatus, setAuthStatus] = useState<'pending' | 'ready' | 'error'>('pending');
    const {setUser} = useUserStore();

    const doLogin = useCallback(async (initDataRaw: string) => {
        try {
            await loginWithTelegram(initDataRaw);
            const token = getToken();
            if (token) initPresenceSocket(token);
            setAuthStatus('ready');
        } catch (e) {
            console.error(e);
            setAuthStatus('error');
        }
    }, []);

    useEffect(() => {
        const initTelegram = async () => {
            const isDev = import.meta.env.DEV;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isTelegram = Boolean((window as any).Telegram?.WebApp?.initData);

            if (isDev && !isTelegram && import.meta.env.VITE_MOCK_AUTH === 'true') {
                const userNum = new URLSearchParams(window.location.search).get('user') ?? '1';

                setUser({
                    id: userNum === '1' ? 111111111 : 222222222,
                    firstName: userNum === '1' ? 'Dev One' : 'Dev Two',
                    username: userNum === '1' ? 'devuser1' : 'devuser2',
                    photoUrl: '',
                    languageCode: 'en',
                });

                await doLogin(`dev_mock_${userNum}`);
                return;
            }

            try {
                // Initialize SDK
                init();

                // Retrieve launch params from hash URL
                const lp = retrieveLaunchParams();
                
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
                    const tgWebApp = (window as Window & { 
                        Telegram?: { WebApp?: { initData?: string } } 
                    }).Telegram?.WebApp;
                    if (tgWebApp?.initData && tgWebApp.initData.length > 0) {
                        initDataRaw = tgWebApp.initData;
                    }
                }

                // Попытка 3: вручную из hash
                if (!initDataRaw) {
                    const hash = window.location.hash.slice(1);
                    const match = hash.match(/(?:^|&)tgWebAppData=([\s\S]*?)(?:&tgWebApp[A-Z]|$)/);
                    if (match && match[1]) {
                        initDataRaw = decodeURIComponent(match[1]);
                    }
                }

                // DEV fallback
                if (!initDataRaw && import.meta.env.DEV) {
                    initDataRaw = import.meta.env.VITE_DEV_INIT_DATA;
                }

                // Попытка распарсить user
                let user;
                if (typeof initDataRaw === 'string') {
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
                        // ignore
                    }
                }

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
                        await doLogin(initDataRaw);
                    } else {
                        throw new Error('No initDataRaw');
                    }
                } else {
                    throw new Error('No user data');
                }
            } catch (error) {
                console.error('[DIAG] Telegram init failed', error);
                
                setUser(
                    {
                        id: 1,
                        firstName: 'Guest',
                        lastName: 'Player',
                        username: 'guest_player'
                    },
                    true
                );
                
                // Для гостей авторизацию не делаем, переходим в ready
                setAuthStatus('ready');
            }
        };
        initTelegram().catch(console.error);
    }, [setUser, doLogin]);
    
    if (authStatus === 'pending') return <LoadingScreen />;
    if (authStatus === 'error') return <AuthErrorScreen />;
    return <>{children}</>;
};
