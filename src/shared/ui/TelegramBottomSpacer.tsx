import React from 'react';
import { viewport } from '@telegram-apps/sdk-react';

export const TelegramBottomSpacer: React.FC = () => {
  const safeAreaBottom = viewport.safeAreaInsetBottom();
  const height = `calc(${safeAreaBottom}px + 16px)`;

  return (
    <div 
      className="flex-none w-full" 
      style={{ height: height }} 
    />
  );
};
