import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { MedicineCard } from '../components/MedicineCard';
import { InteractionCard } from '../components/InteractionCard';
import { StatusBadge } from '../components/StatusBadge';
import { CaregiverAudioSummary } from '../components/CaregiverAudioSummary';
import { LifestyleConditionChecker } from '../components/LifestyleConditionChecker';

interface PrescriptionRecord {
  id: number;
  label: string;
  uploadedAt: string;
  medicines: any[];
}

export const PrescriptionScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [combinedAnalysis, setCombinedAnalysis] = useState<any>(null);
  const [checkingInteractions, setCheckingInteractions] = useState<boolean>(false);

  const handleNewPrescriptionScan = (data: any) => {
    const newRecord: PrescriptionRecord = {
      id: Date.now(),
      label: prescriptions.length === 0 
        ? "Prescription #1 (Existing / Baseline Regimen)" 
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
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/v1/interactions/check-regimen`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active_ingredients: allIngredients }),
        });

        if (response.ok) {
          const result = await response.json();
          setCombinedAnalysis(result);
        }
      } catch (err) {
        console.error("Failed to evaluate cross-prescription interactions:", err);
      } finally {
        setCheckingInteractions(false);
      }
    };

    evaluateCrossPrescriptionInteractions();
  }, [prescriptions]);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MedSafe India - Multi-Prescription Safety Checker</h1>
          <p className="text-sm text-gray-600">
            Upload your existing prescription first, then add new prescriptions to check cross-prescription drug interactions.
          </p>
        </div>
        {prescriptions.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCompareGenericPrices}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 shadow-sm transition"
            >
              <IndianRupee className="w-4 h-4" />
              <span>
                {allDetectedBrands.length > 0
                  ? `Compare Generic Prices (${allDetectedBrands.length})`
                  : 'Compare Generic Prices'}
              </span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
            >
              Clear All Prescriptions
            </button>
          </div>
        )}
      </div>

      {/* Upload Box for Next Prescription */}
      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
        <p className="text-sm font-semibold text-blue-900 mb-1">
          {prescriptions.length === 0
            ? "Step 1: Upload Existing / Ongoing Prescription"
            : `Step ${prescriptions.length + 1}: Upload New Prescription to Compare`}
        </p>
        <SearchBar onSearchResult={handleNewPrescriptionScan} />
      </div>

      {/* Combined Cross-Prescription Safety Alert Banner */}
      {combinedAnalysis && (
        <div className="mb-8 p-5 rounded-xl border bg-white shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Combined Patient Safety Report ({prescriptions.length} {prescriptions.length === 1 ? 'Prescription' : 'Prescriptions'})
              </h2>
              <p className="text-xs text-gray-500">
                Cross-checking {combinedAnalysis.total_ingredients_checked} unique active ingredients across all active medications
              </p>
            </div>
            <StatusBadge status={checkingInteractions ? "Checking..." : combinedAnalysis.safety_status} />
          </div>

          {combinedAnalysis.interactions?.length === 0 ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              ✓ <strong>No Interactions Detected:</strong> Medications across your uploaded prescriptions do not show known conflicting interactions.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-red-700">
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

          {/* Food Timing, Alcohol & Condition Warning Toggle Pills */}
          <LifestyleConditionChecker medicines={allDetectedBrands} />

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
      <div className="space-y-6">
        {prescriptions.map((rx) => (
          <div key={rx.id} className="p-5 border rounded-xl bg-gray-50/70">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-gray-800">{rx.label}</h3>
                <span className="text-xs text-gray-500">Scanned at {rx.uploadedAt}</span>
              </div>
              <button
                onClick={() => handleRemovePrescription(rx.id)}
                className="text-xs text-gray-500 hover:text-red-600 underline"
              >
                Remove Prescription
              </button>
            </div>

            {rx.medicines.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No matching database medicines found in this scan.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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