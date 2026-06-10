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

  // Swipe Back logic
  useEffect(() => {
    // Check if swipe back should be disabled on this route
    const isGameRoute = location.pathname.startsWith('/play/local/') || location.pathname.startsWith('/play/online/');
    const isHome = location.pathname === '/';
    if (isGameRoute || isHome) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      console.log('[SWIPE] start');
      // Ignore multitouch
      if (e.touches.length !== 1) return;

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      console.log('[SWIPE] startX', startX);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      console.log('[SWIPE] end');
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      console.log('[SWIPE] deltaX', deltaX);
      console.log('[SWIPE] deltaY', deltaY);

      // Logic: start from left edge, sufficient horizontal distance, mostly horizontal, vertical deviation limit
      if (
        startX <= 30 && 
        deltaX >= 100 && 
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaY) <= 80
      ) {
        console.log('[SWIPE] Triggering navigate(-1)');
        navigate(-1);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [location.pathname, navigate]);

  return null;
};