// frontend/src/routing/routes.tsx
// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENT: frontend/src/routing/routes.tsx
// Install: npm install react-router-dom
// ─────────────────────────────────────────────────────────────────────────────

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Lazy-load pages for code-splitting
const UserHome      = lazy(() => import('../pages/UserHome/UserHome'));
const UserResult    = lazy(() => import('../pages/UserResult/UserResult'));
const DoctorDashboard = lazy(() => import('../pages/DoctorDashboard/DoctorDashboard'));

const PageLoader: React.FC = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', background: 'var(--bg)',
  }}>
    <div style={{
      width: 28, height: 28,
      border: '2px solid var(--line2)',
      borderTopColor: 'var(--burg)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* User Panel */}
        <Route path="/"        element={<UserHome />} />
        <Route path="/result"  element={<UserResult />} />

        {/* Doctor Panel */}
        <Route path="/doctor"  element={<DoctorDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
