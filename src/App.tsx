import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { TelegramProvider } from './app/providers/TelegramProvider';
import { AppRouter } from './app/AppRouter';
import { TelegramLayout } from './app/TelegramLayout';
import { InviteHandler } from './widgets/invite/InviteHandler';
export function App() {
  return (
    <div className="h-screen w-full bg-tg-bg text-tg-text antialiased selection:bg-tg-primary/30 overflow-hidden">
      <BrowserRouter>
        <TelegramProvider>
          <TelegramLayout>
            <AppRouter />
            <InviteHandler />
          </TelegramLayout>
        </TelegramProvider>
      </BrowserRouter>
      
      <Toaster theme="dark" richColors position="top-center" offset="95px" />
    </div>
  );
}