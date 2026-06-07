

# Tic Tac Toe - Telegram Mini App

A production-ready Telegram Mini App featuring the classic Tic Tac Toe game built with modern web technologies.

## 🎮 Features

- **Classic Gameplay**: Local 2-player pass-and-play Tic Tac Toe
- **Telegram Integration**: Seamlessly integrates with Telegram's Mini App SDK
- **Statistics Tracking**: Persistent win/loss/draw tracking with localStorage
- **Customizable Settings**: Toggle sound effects and animations
- **Responsive Design**: Mobile-first, works perfectly on all devices
- **Modern UI**: Glassmorphism design with smooth animations
- **Theme Sync**: Automatically adapts to Telegram's light/dark theme
- **Accessibility**: Full keyboard navigation and screen reader support

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Telegram Mini Apps SDK** - Telegram integration
- **ESLint & Prettier** - Code quality and formatting

## 📁 Architecture

This project follows **Feature-Sliced Design (FSD)** for scalability and maintainability:

```
src/
├── app/              # App initialization and providers
│   ├── providers/    # TelegramProvider
│   └── AppRouter.tsx # Routing configuration
├── pages/            # Page components
│   ├── Home.tsx
│   ├── Game.tsx
│   ├── Statistics.tsx
│   └── Settings.tsx
├── widgets/          # Complex UI blocks
│   ├── UserCard.tsx
│   ├── StatsSummary.tsx
│   ├── GameBoard.tsx
│   └── GameOverModal.tsx
├── entities/         # Business entities
│   ├── game/         # Game logic and state
│   ├── user/         # User data
│   ├── statistics/   # Stats tracking
│   └── settings/     # App settings
└── shared/           # Reusable utilities
    ├── ui/           # UI components
    ├── lib/          # Utilities
    └── constants/    # Constants
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd telegram-tic-tac-toe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## 📱 Telegram Mini App Setup

1. Create a new bot with [@BotFather](https://t.me/BotFather)
2. Use `/newapp` to create a Mini App
3. Set your web app URL to your deployed application
4. Configure the bot settings as needed

## 🎯 Game Rules

- Players alternate turns placing X and O on a 3x3 grid
- First player to get 3 in a row (horizontal, vertical, or diagonal) wins
- If all 9 squares are filled with no winner, the game is a draw
- Statistics are automatically tracked and persisted

## 🎨 Customization

### Theme

The app automatically syncs with Telegram's theme. When running outside Telegram, it uses system preferences (light/dark mode).

### Settings

Users can customize:
- Sound effects (on/off)
- Animations (on/off)

Settings are persisted in localStorage.

## 📊 State Management

The app uses Zustand with the following stores:

- **gameStore**: Game board, current player, winner detection
- **userStore**: Telegram user data
- **statisticsStore**: Win/loss/draw tracking (persisted)
- **settingsStore**: User preferences (persisted)

## 🔧 Development

### Code Quality

```bash
# Run ESLint
npm run lint

# Format with Prettier
npm run format
```

### Type Checking

```bash
npm run type-check
```

## 📄 License

MIT License - feel free to use this project for learning or as a template for your own Telegram Mini Apps.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for the Telegram Mini Apps platform

