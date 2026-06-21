import React from 'react';

export const TelegramLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
      <main className="min-h-screen">{children}</main>
  );
};
