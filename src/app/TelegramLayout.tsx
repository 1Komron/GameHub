import React, { useState } from 'react';
import { Header } from '../shared/ui/Header';
import { HeaderActionsContext } from '../shared/context/HeaderActionsContext';

export const TelegramLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [extraActions, setExtraActions] = useState<React.ReactNode | null>(null);

  return (
    <HeaderActionsContext.Provider value={{ setExtraActions }}>
      <div className="flex flex-col min-h-screen">
        <Header extraActions={extraActions} />
        <main className="flex-1">{children}</main>
      </div>
    </HeaderActionsContext.Provider>
  );
};
