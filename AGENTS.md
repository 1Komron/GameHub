# GameHub — Agent Rules & Project Context

## Read this file before making ANY changes.

---

## Architecture

This project uses **Feature Sliced Design (FSD)**. Every file has exactly one correct location:

- `src/app/` — router, providers, layout
- `src/games/{game-id}/` — everything specific to one game (engine, store, components)
- `src/pages/` — route-level page components
- `src/shared/` — truly shared, game-agnostic code (ui, config, lib, api)
- `src/entities/` — shared domain models (room, user, settings, statistics, game-engine types)

**Rule:** Never move a file to a layer it does not belong to. Never mix game-specific and shared code.

---

## Established patterns — DO NOT break these

### ENGINE_REGISTRY pattern
All game engines are registered in `src/shared/config/engines.ts`.
Pages use `getEngineById(gameId)` — never hardcode `if (gameId === 'tic-tac-toe')`.

### GameOverModal vs GameResultActions
These are two different components with different behavior:
- `GameOverModal` — fullscreen overlay. Use ONLY in `PlayOnline.tsx`.
- `GameResultActions` — inline block below the board. Use ONLY in `PlayLocal.tsx`.
**Never swap these. Never replace one with the other.**

### PlayLocal top card behavior
`PlayLocal.tsx` has an `AnimatePresence` block at the top that:
- Shows "Current Turn: X/O" while game is ongoing
- Switches to "Player X Wins!" or "Draw Game!" when game ends
This is intentional UX. Do not remove or simplify this block.

### useGameStore generic types
`useGameStore` uses `unknown` generic types intentionally — this allows any game engine to use the same store. Do not re-introduce TicTacToe-specific types here.

### PlayOnline stats recording
Stats, sounds, and match result logic for online games live inside `GameOverModal`. Do not add duplicate logic in `PlayOnline.tsx`.

---

## Games in this project

| Game ID | Status | Engine location |
|---|---|---|
| `tic-tac-toe` | ✅ Playable | `src/games/tic-tac-toe/engine.ts` |
| `checkers` | 🔒 Coming soon | not implemented yet |
| `battleship` | 🔒 Coming soon | not implemented yet |
| `basketball` | 🔒 Coming soon | not implemented yet |
| `bowling` | 🔒 Coming soon | not implemented yet |

Adding a new game = create `src/games/{id}/` folder with `engine.ts`, `store.ts`, `components/`. Then register in `ENGINE_REGISTRY`. Do not modify platform code.

---

## After every change — mandatory

```bash
npm run build
```

Build must pass with 0 errors before task is considered done.

Then confirm architecture compliance:
> "This change follows FSD, does not break any established patterns listed in AGENTS.md, and build passes."
