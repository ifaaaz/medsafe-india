import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LandingPage } from './pages/LandingPage';
import { MedicineCheckerPage } from './pages/MedicineCheckerPage';
import { PrescriptionScannerPage } from './pages/PrescriptionScannerPage';
import { MyMedicinesPage } from './pages/MyMedicinesPage';
import { MedicineDetailsPage } from './pages/MedicineDetailsPage';
import { InteractionResultsPage } from './pages/InteractionResultsPage';
import { SafetyPage } from './pages/SafetyPage';

export function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <div className="flex-1 flex max-w-7xl w-full mx-auto">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/checker" element={<MedicineCheckerPage />} />
                <Route path="/scanner" element={<PrescriptionScannerPage />} />
                <Route path="/my-medicines" element={<MyMedicinesPage />} />
                <Route path="/medicines/:id" element={<MedicineDetailsPage />} />
                <Route path="/interactions" element={<InteractionResultsPage />} />
                <Route path="/safety" element={<SafetyPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;