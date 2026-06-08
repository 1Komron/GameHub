import { TelegramProvider } from './src/app/providers/TelegramProvider';
import { AppRouter } from './src/app/AppRouter';
export function App() {
  return (
    <div className="min-h-screen w-full bg-tg-bg text-tg-text antialiased selection:bg-tg-primary/30" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <TelegramProvider>
        <AppRouter />
      </TelegramProvider>
    </div>);

}