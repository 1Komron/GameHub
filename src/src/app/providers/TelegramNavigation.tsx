import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { backButton, viewport } from '@telegram-apps/sdk-react';
/**
 * Controls Telegram's native Back Button based on the current
 * route. All SDK access is guarded so this is a safe no-op when running
 * outside of Telegram (e.g. browser/web preview).
 */
export const TelegramNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  // Mount viewport + buttons once.
  useEffect(() => {
    const initViewport = async () => {
      try {
        if (viewport.mount.isAvailable()) {
          console.log('[DIAG] viewport isMounted before mount:', viewport.isMounted());
          await viewport.mount();
          console.log('[DIAG] viewport isMounted after mount:', viewport.isMounted());

          viewport.expand();
          viewport.bindCssVars();

          if (viewport.requestFullscreen.isAvailable()) {
            console.log('[DEBUG] fullscreen available');
            await viewport.requestFullscreen();
            console.log('[DEBUG] is fullscreen:', viewport.isFullscreen());
          } else {
            console.log('[DEBUG] fullscreen NOT available');
          }
        }
      } catch (e) {
        console.error('[DIAG] viewport init error:', e);
      }
    };
    initViewport();
    try {
      if (backButton.mount.isAvailable()) backButton.mount();
    } catch {
      /* Not inside Telegram — ignore. */
    }
  }, []);
  // Back Button: visible on every screen except Home, navigates back.
  useEffect(() => {
    try {
      if (!backButton.isMounted()) return;
      if (isHome) {
        backButton.hide();
        return;
      }
      backButton.show();
      const off = backButton.onClick(() => navigate(-1));
      return () => off();
    } catch {
      /* no-op outside Telegram */
    }
  }, [isHome, navigate]);
  return null;
};