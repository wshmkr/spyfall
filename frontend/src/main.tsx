import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import HomePage from './pages/HomePage.tsx';
import GamePage from './pages/GamePage.tsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:lobbyId" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
