import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { ModeSelect } from '../pages/ModeSelect';
import { Lobby } from '../pages/Lobby';
import { PlayLocal } from '../pages/PlayLocal';
import { PlayOnline } from '../pages/PlayOnline';
import { Statistics } from '../pages/Statistics';
import { Settings } from '../pages/Settings';
import { TelegramNavigation } from './providers/TelegramNavigation';
export const AppRouter: React.FC = () => {
  return (
    <>
      <TelegramNavigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:gameId/mode" element={<ModeSelect />} />
        <Route path="/lobby/:code" element={<Lobby />} />
        <Route path="/play/local/:gameId" element={<PlayLocal />} />
        <Route path="/play/online/:code" element={<PlayOnline />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>);

};