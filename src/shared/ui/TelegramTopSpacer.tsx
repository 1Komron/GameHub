import React from 'react';
import { viewport } from '@telegram-apps/sdk-react';

export const TelegramTopSpacer: React.FC = () => {
  // Use safe area inset top plus a base height to ensure enough space for the header area
  const safeAreaTop = viewport.safeAreaInsetTop();
  const height = `calc(${safeAreaTop}px + 56px)`;

  console.log('[TelegramTopSpacer] safeAreaTop:', safeAreaTop, 'computed height:', height);

  return (
    <div 
      className="flex-none w-full bg-tg-bg" 
      style={{ height: height }} 
    />
  );
};
