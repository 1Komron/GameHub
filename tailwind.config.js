
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tg: {
          bg: 'var(--tg-theme-bg-color, #ffffff)',
          text: 'var(--tg-theme-text-color, #000000)',
          hint: 'var(--tg-theme-hint-color, #999999)',
          link: 'var(--tg-theme-link-color, #2481cc)',
          primary: 'var(--tg-theme-button-color, #2481cc)',
          'primary-text': 'var(--tg-theme-button-text-color, #ffffff)',
          secondary: 'var(--tg-theme-secondary-bg-color, #f0f0f0)',
        }
      },
      animation: {
        'pop-in': 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'blink': 'blink 1.2s ease-in-out infinite',
        'hud-pulse': 'hudPulse 2s ease-in-out infinite',
        'draw-in': 'drawIn 0.125s linear both',
        'draw-in-delay-1': 'drawIn 0.125s linear 0.125s both',
        'draw-out': 'drawOut 0.125s linear both',
        'draw-out-delay-1': 'drawOut 0.125s linear 0.125s both',
        'circle-draw-in': 'drawIn 0.25s linear both',
        'circle-draw-out': 'drawOut 0.25s linear both',
      },
      keyframes: {
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        blink: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1.2) drop-shadow(0 0 8px currentColor)' },
          '50%': { opacity: '0.5', filter: 'brightness(0.8)' },
        },
        hudPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        drawIn: {
          from: { strokeDashoffset: '1' },
          to: { strokeDashoffset: '0' }
        },
        drawOut: {
          from: { strokeDashoffset: '0' },
          to: { strokeDashoffset: '1' }
        }
      }
    },
  },
  plugins: [],
}
