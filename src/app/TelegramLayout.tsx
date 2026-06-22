import React from 'react';

export const TelegramLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
      <main className="h-screen w-full overflow-hidden">{children}</main>
  );
};
