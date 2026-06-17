import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { backButton, viewport } from '@telegram-apps/sdk-react';
import { disableVerticalSwipes, isSwipeBehaviorSupported, mountSwipeBehavior, isSwipeBehaviorMounted } from '@telegram-apps/sdk';
import { useRoomStore } from '../../entities/room/model/store';
import { useGameStore } from '../../games/tic-tac-toe/store';
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
          
          try {
            if (isSwipeBehaviorSupported()) {
              if (!isSwipeBehaviorMounted()) {
                await mountSwipeBehavior();
              }
              disableVerticalSwipes();
            }
          } catch {
            /* no-op outside Telegram or unsupported */
          }

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
  // Back Button: visible on every screen except Home, navigates back based on path.
  useEffect(() => {
    try {
      if (!backButton.isMounted()) return;
      if (isHome) {
        backButton.hide();
        return;
      }
      backButton.show();
      const off = backButton.onClick(() => {
        const path = location.pathname;
        
        if (path === '/') {
          return; // already hidden on home, no-op
        }
        
        if (path.startsWith('/play/online/')) {
          // During active online game — leave match, go to lobby
          const { room, leaveRoom } = useRoomStore.getState();
          const { resetGame, gameState, engine } = useGameStore.getState();
          const isGameOver = engine && gameState 
            ? (engine.getStatus(gameState) === 'won' || engine.getStatus(gameState) === 'draw')
            : false;
          
          if (room) {
            if (!isGameOver) {
              leaveRoom();
            }
            resetGame();
            navigate(`/lobby/${room.code}`);
          } else {
            navigate('/');
          }
          return;
        }
        
        if (path.startsWith('/lobby/')) {
          // From lobby — always go home, leave room
          useRoomStore.getState().leaveRoom();
          navigate('/');
          return;
        }
        
        if (path.startsWith('/game/') && path.endsWith('/mode')) {
          // ModeSelect — go home
          navigate('/');
          return;
        }
        
        // default fallback
        navigate(-1);
      });
      return () => off();
    } catch {
      /* no-op outside Telegram */
    }
  }, [location.pathname, navigate]);

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