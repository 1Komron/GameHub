import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { backButton, mainButton, viewport } from '@telegram-apps/sdk-react';
import { useGameStore } from '../../entities/game/model/store';
/**
 * Controls Telegram's native Back Button and Main Button based on the current
 * route. All SDK access is guarded so this is a safe no-op when running
 * outside of Telegram (e.g. browser/web preview).
 */
export const TelegramNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const resetGame = useGameStore((s) => s.resetGame);
  const isHome = location.pathname === '/';
  const isPlayRoute = location.pathname.startsWith('/play/');
  // Mount viewport + buttons once.
  useEffect(() => {
    try {
      if (viewport.mount.isAvailable()) {
        viewport.mount();
        viewport.expand();
        viewport.bindCssVars();
      }
      if (backButton.mount.isAvailable()) backButton.mount();
      if (mainButton.mount.isAvailable()) mainButton.mount();
    } catch {

      /* Not inside Telegram — ignore. */}
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

      /* no-op outside Telegram */}
  }, [isHome, navigate]);
  // Main Button: contextual "Restart Game" action on Play screens only.
  useEffect(() => {
    try {
      if (!mainButton.isMounted()) return;
      if (!isPlayRoute) {
        mainButton.setParams({
          isVisible: false
        });
        return;
      }
      mainButton.setParams({
        text: 'Restart Game',
        isVisible: true
      });
      const off = mainButton.onClick(() => resetGame());
      return () => {
        off();
        mainButton.setParams({
          isVisible: false
        });
      };
    } catch {

      /* no-op outside Telegram */}
  }, [isPlayRoute, resetGame]);
  return null;
};