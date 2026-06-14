# Project Map: GameHub Mini App

## Project Overview
GameHub is a premium Telegram Mini App for real-time multiplayer gaming, following **Feature-Sliced Design (FSD)** principles. It features a **neon-dark cyber-aesthetic** with glassmorphism and real-time WebSocket synchronization.

---

## 1. Root Configurations

### `package.json`
**Responsibility:** Manages project dependencies (React, Telegram SDK, Zustand, Socket.io, Framer Motion) and build scripts.

### `tailwind.config.js`
**Responsibility:** Configures Tailwind CSS theme, including custom `tg` colors mapped to Telegram theme variables and neon-glow animations.

### `tsconfig.json`
**Responsibility:** Defines TypeScript compiler rules, paths, and module resolution for the project.

### `vite.config.ts`
**Responsibility:** Configuration for the Vite build tool and the React plugin.

### `index.html`
**Responsibility:** The main HTML template and entry point for the single-page application.

### `src/canvas.manifest.js`
**Responsibility:** Stores coordinate-based manifest settings for the visual layout of screens and sections.

### `src/useScreenInit.js`
**Responsibility:** A helper hook that initializes screen state based on URL parameters and the manifest.

### `src/App.tsx`
**Responsibility:** The main React entry component. Sets the global dark-cyber gradient background and initializes providers.
**Critical Snippet:**
```tsx
export function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white antialiased">
      <TelegramProvider>
        <TelegramLayout>
          <AppRouter />
        </TelegramLayout>
      </TelegramProvider>
    </div>
  );
}
```

### `src/index.tsx`
**Responsibility:** Standard entry point that mounts the React `App` into the root DOM element.

### `src/index.css`
**Responsibility:** Global styles, custom font imports, and critical glassmorphism utility classes.
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```

---

## 2. App Layer (`src/app/`)

### `src/app/AppRouter.tsx`
**Responsibility:** Centralized routing table using `react-router-dom`.
**Critical Snippet:**
```tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/game/:gameId/mode" element={<ModeSelect />} />
  <Route path="/lobby/:code" element={<Lobby />} />
  <Route path="/play/local/:gameId" element={<PlayLocal />} />
  <Route path="/play/online/:code" element={<PlayOnline />} />
</Routes>
```

### `src/app/TelegramLayout.tsx`
**Responsibility:** A wrapper layout component that ensures the application fits correctly within the Telegram viewport.

### `src/app/providers/TelegramNavigation.tsx`
**Responsibility:** Manages Telegram's native Back Button visibility and handles swipe-back gestures for navigation.

---

## 3. Entities Layer (`src/entities/`)

### `src/entities/game-engine/types.ts`
**Responsibility:** Defines core types like `GameId`, `PlayerSlot`, `MatchStatus`, and the `GameEngine` interface.

### `src/entities/room/model/store.ts`
**Responsibility:** Zustand store for managing online room lifecycle (create, join, ready).
**Critical Snippet:**
```tsx
createRoom: async (gameId: GameId) => {
  const room = await transport.createRoom(gameId);
  set({ room, mySlot: 0, isConnecting: false, matchId: transport.getMatchId() });
}
```

### `src/entities/settings/model/store.ts`
**Responsibility:** Persisted store for user preferences (sound, animations, language).

### `src/entities/statistics/model/store.ts`
**Responsibility:** Persisted store tracking wins, losses, and favorite games.

### `src/entities/user/model/store.ts`
**Responsibility:** Store for Telegram user data (ID, name, photo URL).

---

## 4. Tic-Tac-Toe Game Layer (`src/games/tic-tac-toe/`)

### `src/games/tic-tac-toe/engine.ts`
**Responsibility:** Pure logic for game mechanics: valid moves, board updates, and win conditions.
**Critical Snippet:**
```tsx
applyMove: (state, move, slot) => {
  const board = [...state.board];
  board[move.index] = slot;
  return { ...state, board, current: (slot === 0 ? 1 : 0) };
}
```

### `src/games/tic-tac-toe/store.ts`
**Responsibility:** Game state management with **Optimistic UI Updates** and server state reconciliation.
**Critical Snippet:**
```tsx
makeMove: (move) => {
  const nextState = engine.applyMove(gameState, move, currentSlot);
  set({ gameState: nextState, ghostPiece: ghost }); // Optimistic local update
  if (mode === 'online') {
    transport.sendMove({ slot: currentSlot, move });
  }
}
```

### `src/games/tic-tac-toe/components/AnimatedO.tsx`
**Responsibility:** Renders a neon-red animated 'O' symbol with a glow drop-shadow.

### `src/games/tic-tac-toe/components/AnimatedX.tsx`
**Responsibility:** Renders a neon-blue animated 'X' symbol with a glow drop-shadow.

### `src/games/tic-tac-toe/components/AnimationOverlay.tsx`
**Responsibility:** Visual overlay for move transitions.

### `src/games/tic-tac-toe/components/GameBoard.tsx`
**Responsibility:** Interactive 3x3 grid with animated symbols and a dynamic, rotating winning line.
**Critical Snippet:**
```tsx
const getLineStyles = () => {
  const sortedLine = [...winningLine].sort((x, y) => x - y);
  const [a, , c] = sortedLine;
  if (a === 0 && c === 8) return { top: '50%', left: '5%', right: '5%', height: '6px', rotate: 45 };
  // ... other positions ...
};
```

### `src/games/tic-tac-toe/components/GameOverModal.tsx`
**Responsibility:** Full-screen modal triggered after a match ends, showing results and recording stats.

### `src/games/tic-tac-toe/components/GameResultActions.tsx`
**Responsibility:** Bottom UI block with pulsing emojis and result text (Win/Loss/Draw).

### `src/games/tic-tac-toe/components/StatsSummary.tsx`
**Responsibility:** Displays a summarized view of player statistics.

---

## 5. Pages Layer (`src/pages/`)

### `src/pages/Home.tsx`
**Responsibility:** Landing page featuring the game catalog and user profile card.

### `src/pages/Lobby.tsx`
**Responsibility:** Online waiting room where players wait for opponents and ready up.

### `src/pages/ModeSelect.tsx`
**Responsibility:** Screen for choosing between Local (Classic/Shift) and Online modes.

### `src/pages/PlayLocal.tsx`
**Responsibility:** Page container for the offline pass-and-play mode.

### `src/pages/PlayOnline.tsx`
**Responsibility:** Page container for the online multiplayer mode via WebSockets.

### `src/pages/Settings.tsx`
**Responsibility:** User interface for adjusting game settings.

### `src/pages/Statistics.tsx`
**Responsibility:** Leaderboard and personal records display.

---

## 6. Shared Layer (`src/shared/`)

### Shared API (`src/shared/api/`)
- **`src/shared/api/auth/authService.ts`**: Handles Telegram SSO and JWT token management.
- **`src/shared/api/socket/events.ts`**: TypeScript interfaces for WebSocket payloads.
- **`src/shared/api/socket/index.ts`**: Singleton instantiator for the transport layer.
- **`src/shared/api/socket/mockTransport.ts`**: In-memory transport for simulated local testing.
- **`src/shared/api/socket/realTransport.ts`**: Live WebSocket transport with state normalization.
  - **Snippet:** `this.ws = new WebSocket(`${WS_URL}/ws/matches/${matchId}`);`
- **`src/shared/api/socket/transport.ts`**: Abstract interface defining the transport contract.

### Shared Configuration (`src/shared/config/`)
- **`src/shared/config/engines.ts`**: Registry mapping game IDs to their engine implementations.
- **`src/shared/config/games.ts`**: Global catalog of games with titles, descriptions, and assets.
- **`src/shared/config/socket.ts`**: Environment-based URL settings for API and WebSockets.

### Shared Library (`src/shared/lib/`)
- **`src/shared/lib/sound.ts`**: Audio service synthesizing game sound effects via Web Audio API.
- **`src/shared/lib/utils.ts`**: Utility for merging Tailwind classes (`cn`).

### Shared UI Elements (`src/shared/ui/`)
- **`src/shared/ui/Avatar.tsx`**: Renders player profile images or initials.
- **`src/shared/ui/Button.tsx`**: Versatile button component with Framer Motion tap/hover effects.
- **`src/shared/ui/GlassCard.tsx`**: Core glassmorphism container using backdrop filters.
- **`src/shared/ui/TelegramTopSpacer.tsx`**: Responsive spacer that respects Telegram's safe area.
- **`src/shared/ui/Toggle.tsx`**: Animated switch component for settings.
- **`src/shared/ui/UserCard.tsx`**: Card displaying user identity and total games played.

### Shared Constants & Localization (`src/shared/constants/` & `i18n/`)
- **`src/shared/constants/game.ts`**: Shared constants like winning combinations.
- **`src/shared/i18n/index.ts`**: Localization engine supporting English and Russian translations.
