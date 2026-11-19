import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useIsMobile } from './hooks/useIsMobile';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';

import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { MedicineCheckerPage } from './pages/MedicineCheckerPage';
import { PrescriptionScannerPage } from './pages/PrescriptionScannerPage';
import { MyMedicinesPage } from './pages/MyMedicinesPage';
import { MedicineDetailsPage } from './pages/MedicineDetailsPage';
import { InteractionResultsPage } from './pages/InteractionResultsPage';
import { SafetyPage } from './pages/SafetyPage';
import { JanAushadhiSaver } from './pages/JanAushadhiSaver';

const ProtectedWorkspace: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile(1024);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {isMobile ? (
        /* Dedicated Mobile App Experience */
        <>
          <main className="flex-1 w-full px-3.5 py-4 pb-24 overflow-y-auto">
            {children}
          </main>
          <MobileBottomNav />
        </>
      ) : (
        /* Dedicated Desktop Clinical Workspace */
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* Public Split-Screen Clinical Login & Demo Entry */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Workspace (Automatically switches Mobile vs Desktop UI) */}
            <Route
              path="/*"
              element={
                <ProtectedWorkspace>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/checker" element={<MedicineCheckerPage />} />
                    <Route path="/scanner" element={<PrescriptionScannerPage />} />
                    <Route path="/my-medicines" element={<MyMedicinesPage />} />
                    <Route path="/medicines/:id" element={<MedicineDetailsPage />} />
                    <Route path="/interactions" element={<InteractionResultsPage />} />
                    <Route path="/generic-saver" element={<JanAushadhiSaver />} />
                    <Route path="/safety" element={<SafetyPage />} />
                    <Route path="*" element={<Navigate to="/scanner" replace />} />
                  </Routes>
                </ProtectedWorkspace>
              }
            />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;