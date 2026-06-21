import { createContext } from 'react';

export const HeaderActionsContext = createContext<{
  setExtraActions: (node: React.ReactNode | null) => void;
}>({ setExtraActions: () => {} });
