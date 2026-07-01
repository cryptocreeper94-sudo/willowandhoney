import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { AdminDashboard } from './AdminDashboard.tsx';
import { DevPortal } from './DevPortal.tsx';
import Portal from './pages/Portal.tsx';
import { registerSW } from 'virtual:pwa-register';
import './index.css';

// Aggressive cachebuster: reload immediately if a new PWA version is found
registerSW({ immediate: true, onNeedRefresh() { window.location.reload(); } });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dev" element={<DevPortal />} />
        <Route path="/portal" element={<Portal />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
