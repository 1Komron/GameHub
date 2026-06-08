import { TelegramProvider } from './src/app/providers/TelegramProvider';
import { AppRouter } from './src/app/AppRouter';
import { TelegramLayout } from './src/app/TelegramLayout';
export function App() {
  return (
    <div className="min-h-screen w-full bg-tg-bg text-tg-text antialiased selection:bg-tg-primary/30">
      <TelegramProvider>
        <TelegramLayout>
          <AppRouter />
        </TelegramLayout>
      </TelegramProvider>
    </div>);

}