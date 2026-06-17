import { TelegramProvider } from './app/providers/TelegramProvider';
import { AppRouter } from './app/AppRouter';
import { TelegramLayout } from './app/TelegramLayout';
export function App() {
  return (
    <div className="h-screen w-full bg-tg-bg text-tg-text antialiased selection:bg-tg-primary/30 overflow-y-auto overscroll-y-contain">

      <div
        className="flex-none bg-tg-bg"
        style={{ height: '90px' }}
      />

      <TelegramProvider>
        <TelegramLayout>
          <AppRouter />
        </TelegramLayout>
      </TelegramProvider>

    </div>
  );
}