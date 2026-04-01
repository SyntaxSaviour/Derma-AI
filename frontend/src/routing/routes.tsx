// frontend/src/routing/routes.tsx
// PLACEMENT: frontend/src/routing/routes.tsx
// Updated to include Landing page as entry point

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const Landing         = lazy(() => import('../pages/Landing/Landing'));
const UserHome        = lazy(() => import('../pages/UserHome/UserHome'));
const UserResult      = lazy(() => import('../pages/UserResult/UserResult'));
const DoctorDashboard = lazy(() => import('../pages/DoctorDashboard/DoctorDashboard'));

const PageLoader: React.FC = () => (
  <div style={{
    display:'flex', alignItems:'center', justifyContent:'center',
    minHeight:'100vh', background:'#FAF7F2',
  }}>
    <div style={{
      width:24, height:24,
      border:'2px solid rgba(107,30,58,0.15)',
      borderTopColor:'#6B1E3A',
      borderRadius:'50%',
      animation:'spin 0.8s linear infinite',
    }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader/>}>
      <Routes>
        {/* Landing — entry point */}
        <Route path="/welcome" element={<Landing/>}/>

        {/* User Panel */}
        <Route path="/"       element={<UserHome/>}/>
        <Route path="/result" element={<UserResult/>}/>

        {/* Doctor Panel */}
        <Route path="/doctor" element={<DoctorDashboard/>}/>

        {/* Default redirect to landing */}
        <Route path="*" element={<Navigate to="/welcome" replace/>}/>
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
