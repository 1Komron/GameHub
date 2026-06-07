import { useSettingsStore } from '../../entities/settings/model/store';

const dictionary = {
  en: {
    home: {
      title: 'Game Hub',
      gamesPlayed: 'Games Played',
      wins: 'Wins',
      losses: 'Losses',
      draws: 'Draws',
      play: 'Play',
      comingSoon: 'Coming Soon'
    },
    mode: {
      title: 'Select Mode',
      local: 'Pass & Play (Local)',
      localDesc: 'Play together on one device',
      localClassic: 'Classic Mode',
      localShift: 'Shift Mode',
      online: 'Play Online',
      onlineDesc: 'Create or join a room with friends',
      createRoom: 'Create Room',
      joinRoom: 'Join Room',
      enterCode: 'Enter Room Code'
    },
    lobby: {
      title: 'Game Lobby',
      roomCode: 'Room Code',
      waiting: 'Waiting for opponent...',
      ready: 'Ready',
      notReady: 'Not Ready',
      startGame: 'Start Game',
      leaveRoom: 'Leave Room'
    },
    settings: {
      title: 'Settings',
      sound: 'Sound Effects',
      animations: 'Animations',
      language: 'Language',
      theme: 'Theme'
    },
    stats: {
      title: 'Statistics',
      totalGames: 'Total Games',
      favoriteGame: 'Favorite Game',
      reset: 'Reset Statistics'
    }
  },
  ru: {
    home: {
      title: 'Игровой Центр',
      gamesPlayed: 'Сыграно игр',
      wins: 'Победы',
      losses: 'Поражения',
      draws: 'Ничьи',
      play: 'Играть',
      comingSoon: 'Скоро'
    },
    mode: {
      title: 'Выберите режим',
      local: 'На одном устройстве',
      localDesc: 'Играйте вместе на одном экране',
      localClassic: 'Классический режим',
      localShift: 'Режим Shift',
      online: 'Играть онлайн',
      onlineDesc: 'Создайте или присоединитесь к комнате',
      createRoom: 'Создать комнату',
      joinRoom: 'Присоединиться',
      enterCode: 'Введите код комнаты'
    },
    lobby: {
      title: 'Лобби',
      roomCode: 'Код комнаты',
      waiting: 'Ожидание соперника...',
      ready: 'Готов',
      notReady: 'Не готов',
      startGame: 'Начать игру',
      leaveRoom: 'Покинуть комнату'
    },
    settings: {
      title: 'Настройки',
      sound: 'Звуковые эффекты',
      animations: 'Анимации',
      language: 'Язык',
      theme: 'Тема'
    },
    stats: {
      title: 'Статистика',
      totalGames: 'Всего игр',
      favoriteGame: 'Любимая игра',
      reset: 'Сбросить статистику'
    }
  }
};

export type Language = 'en' | 'ru';

export const t = (key: string): string => {
  const lang = useSettingsStore.getState().language || 'en';
  const keys = key.split('.');
  let current: Record<string, unknown> = dictionary[lang as Language];

  for (const k of keys) {
    if (typeof current !== 'object' || current === null || !(k in current)) return key;
    current = current[k] as Record<string, unknown>;
  }

  return current as unknown as string;
};