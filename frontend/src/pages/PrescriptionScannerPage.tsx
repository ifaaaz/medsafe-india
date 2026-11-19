import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SearchBar } from '../components/SearchBar';
import { MedicineCard } from '../components/MedicineCard';
import { InteractionCard } from '../components/InteractionCard';
import { StatusBadge } from '../components/StatusBadge';
import { CaregiverAudioSummary } from '../components/CaregiverAudioSummary';
import { LifestyleConditionChecker } from '../components/LifestyleConditionChecker';
import { DailyPillOrganizer } from '../components/DailyPillOrganizer';

interface PrescriptionRecord {
  id: number;
  label: string;
  uploadedAt: string;
  medicines: any[];
}

export const PrescriptionScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [combinedAnalysis, setCombinedAnalysis] = useState<any>(null);
  const [checkingInteractions, setCheckingInteractions] = useState<boolean>(false);

  const handleNewPrescriptionScan = (data: any) => {
    const newRecord: PrescriptionRecord = {
      id: Date.now(),
      label:
        prescriptions.length === 0
          ? 'Prescription #1 (Existing / Baseline Regimen)'
          : `Prescription #${prescriptions.length + 1} (New Consultation)`,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      medicines: data.detected_medicines || [],
    };

    setPrescriptions((prev) => [...prev, newRecord]);
  };

  const handleRemovePrescription = (id: number) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAll = () => {
    setPrescriptions([]);
    setCombinedAnalysis(null);
  };

  const allDetectedBrands = Array.from(
    new Set(
      prescriptions.flatMap((rx) =>
        rx.medicines
          .map((med: any) =>
            typeof med === 'string'
              ? med
              : med.brand_name || med.name || med.medicine_name || med.generic_name
          )
          .filter(Boolean)
      )
    )
  );

  const handleCompareGenericPrices = () => {
    navigate('/generic-saver', {
      state: { medicines: allDetectedBrands },
    });
  };

  useEffect(() => {
    if (prescriptions.length === 0) {
      setCombinedAnalysis(null);
      return;
    }

    const evaluateCrossPrescriptionInteractions = async () => {
      setCheckingInteractions(true);

      const allIngredients: string[] = [];
      prescriptions.forEach((rx) => {
        rx.medicines.forEach((med: any) => {
          const ings = med.active_ingredients || med.ingredients || [];
          ings.forEach((ing: any) => {
            allIngredients.push(typeof ing === 'string' ? ing : ing.name);
          });
        });
      });

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/interactions/check-regimen`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active_ingredients: allIngredients }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          setCombinedAnalysis(result);
        }
      } catch (err) {
        console.error('Failed to evaluate cross-prescription interactions:', err);
      } finally {
        setCheckingInteractions(false);
      }
    };

    evaluateCrossPrescriptionInteractions();
  }, [prescriptions]);

  const activeStep = prescriptions.length === 0 ? 1 : combinedAnalysis ? 2 : 1;

  return (
    <div className="container mx-auto px-1 sm:px-4 py-2 sm:py-4 max-w-5xl">
      {/* Header & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Multi-Prescription Safety Checker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Upload your existing prescription first, then add new prescriptions to check cross-prescription interactions.
          </p>
        </div>
        {prescriptions.length > 0 && (
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handleCompareGenericPrices}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-sm transition cursor-pointer"
            >
              <IndianRupee className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {allDetectedBrands.length > 0
                  ? `Generic Prices (${allDetectedBrands.length})`
                  : 'Generic Prices'}
              </span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-rose-600 border border-rose-300 rounded-xl hover:bg-rose-50 transition cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* 3-Step Clinical Workflow Stepper */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        {[
          { step: 1, title: 'Upload Rx', desc: 'Scan printed or handwritten Rx' },
          { step: 2, title: 'Safety & Voice', desc: 'Interactions, pillbox & audio' },
          { step: 3, title: 'Generic Saver', desc: 'Compare Jan Aushadhi MRP' },
        ].map(({ step, title, desc }) => {
          const isCompleted = activeStep > step;
          const isCurrent = activeStep === step;
          return (
            <div
              key={step}
              className={`p-2.5 sm:p-3 rounded-2xl border transition ${
                isCurrent
                  ? 'bg-teal-50/90 border-teal-500 shadow-2xs'
                  : isCompleted
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-white border-slate-200 opacity-75'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-teal-700 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {step}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">{title}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 hidden sm:block">{desc}</p>
            </div>
          );
        })}
      </div>

      {/* Upload Box for Next Prescription */}
      <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 mb-6">
        <p className="text-xs sm:text-sm font-semibold text-teal-950 mb-1.5">
          {prescriptions.length === 0
            ? 'Step 1: Upload Existing / Ongoing Prescription'
            : `Step ${prescriptions.length + 1}: Upload New Prescription to Compare`}
        </p>
        <SearchBar onSearchResult={handleNewPrescriptionScan} />
      </div>

      {/* Combined Cross-Prescription Safety Alert Banner */}
      {combinedAnalysis && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Combined Patient Safety Report ({prescriptions.length}{' '}
                {prescriptions.length === 1 ? 'Prescription' : 'Prescriptions'})
              </h2>
              <p className="text-xs text-slate-500">
                Cross-checking {combinedAnalysis.total_ingredients_checked} unique active ingredients across all active medications
              </p>
            </div>
            <StatusBadge status={checkingInteractions ? 'Checking...' : combinedAnalysis.safety_status} />
          </div>

          {combinedAnalysis.interactions?.length === 0 ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm">
              ✓ <strong>No Interactions Detected:</strong> Medications across your uploaded prescriptions do not show known conflicting interactions.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-rose-700">
                ⚠️ Warning: {combinedAnalysis.total_interactions_found} Drug-Drug Interaction(s) Found Across Prescriptions!
              </p>
              {combinedAnalysis.interactions.map((item: any, idx: number) => (
                <InteractionCard
                  key={idx}
                  ingredientA={item.ingredient_a}
                  ingredientB={item.ingredient_b}
                  severity={item.severity}
                  description={item.interaction_description}
                  management={item.management_information}
                />
              ))}
            </div>
          )}

          {/* Food Timing, Alcohol & Auto-Linked Login Health Condition Check */}
          <LifestyleConditionChecker
            medicines={allDetectedBrands}
            initialConditions={user?.savedConditions || []}
          />

          {/* Visual Morning / Afternoon / Night Pill Organizer + WhatsApp Caregiver Share */}
          <DailyPillOrganizer medicines={allDetectedBrands} />

          {/* Multilingual Caregiver Voice Readout (English, Kannada, Hindi) */}
          <CaregiverAudioSummary
            medicines={allDetectedBrands}
            safetyStatus={combinedAnalysis.safety_status}
            interactionsCount={combinedAnalysis.total_interactions_found || 0}
            interactions={combinedAnalysis.interactions || []}
          />
        </div>
      )}

      {/* Individual Prescriptions Breakdown */}
      <div className="space-y-5">
        {prescriptions.map((rx) => (
          <div key={rx.id} className="p-4 sm:p-5 border border-slate-200 rounded-2xl bg-slate-50/70">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{rx.label}</h3>
                <span className="text-xs text-slate-500">Scanned at {rx.uploadedAt}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePrescription(rx.id)}
                className="text-xs text-slate-500 hover:text-rose-600 underline cursor-pointer"
              >
                Remove
              </button>
            </div>

            {rx.medicines.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-500 italic">
                No matching database medicines found in this scan.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {rx.medicines.map((med: any, idx: number) => (
                  <MedicineCard
                    key={idx}
                    brandName={med.brand_name}
                    genericName={med.generic_name}
                    strength={med.strength}
                    ingredients={med.active_ingredients}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrescriptionScannerPage;