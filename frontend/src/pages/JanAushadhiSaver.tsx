import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface GenericMedicineItem {
  brand_name: string;
  active_salt_ip: string;
  pack_unit: string;
  estimated_brand_mrp_inr: number;
  estimated_jan_aushadhi_mrp_inr: number;
  savings_inr: number;
  savings_percent: number;
  pharmacist_note: string;
}

interface GenericComparisonResponse {
  items: GenericMedicineItem[];
  total_branded_inr: number;
  total_generic_inr: number;
  total_savings_inr: number;
  overall_savings_percent: number;
  disclaimer: string;
}

interface JanAushadhiSaverProps {
  initialMedicines?: string[];
}

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function JanAushadhiSaver({ initialMedicines = [] }: JanAushadhiSaverProps) {
  const location = useLocation();
  const routedMedicines: string[] = Array.isArray(location.state?.medicines)
    ? location.state.medicines
    : [];

  const startingMedicines =
    routedMedicines.length > 0 ? routedMedicines : initialMedicines;

  const [inputValue, setInputValue] = useState(
    startingMedicines.length > 0
      ? startingMedicines.join(", ")
      : "Augmentin 625 Duo, Telma 40, Pan-D, Ecosprin 75"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenericComparisonResponse | null>(null);

  const fetchComparison = async (meds: string[]) => {
    if (meds.length === 0) {
      setError("Please enter at least one medicine brand name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/v1/generic-saver/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicines: meds }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Request failed with status ${res.status}`);
      }

      const data: GenericComparisonResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch Jan Aushadhi comparison.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-run comparison when navigated from PrescriptionScannerPage with scanned brands
  useEffect(() => {
    if (routedMedicines.length > 0) {
      setInputValue(routedMedicines.join(", "));
      fetchComparison(routedMedicines);
    }
  }, [location.key]);

  const handleCompare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const meds = inputValue
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    await fetchComparison(meds);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <h2 className="text-2xl font-bold text-slate-900">
            Jan Aushadhi Generic Cost Saver
          </h2>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
            PMBJP Affordability Engine
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Compare branded prescription prices against equivalent Indian Pharmacopoeia (IP) generic medicines available at Jan Aushadhi Kendras.
        </p>

        <form onSubmit={handleCompare} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g., Augmentin 625 Duo, Telma 40, Dolo 650"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm transition"
          >
            {loading ? "Calculating Savings..." : "Compare Generic Prices"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {result && (
        <>
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-100 font-semibold">
                Estimated Prescription Savings
              </p>
              <h3 className="text-3xl font-extrabold mt-1">
                Save ₹{result.total_savings_inr.toFixed(0)}{" "}
                <span className="text-lg font-medium text-emerald-100">
                  ({result.overall_savings_percent}% off)
                </span>
              </h3>
              <p className="text-xs text-emerald-100 mt-1">
                Branded Est.: ₹{result.total_branded_inr.toFixed(0)} → Jan Aushadhi Est.: ₹
                {result.total_generic_inr.toFixed(0)}
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-xs max-w-xs">
              Same active chemical salt &amp; therapeutic strength under Indian Pharmacopoeia (IP) standards.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{item.brand_name}</h4>
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Save {item.savings_percent}%
                    </span>
                  </div>
                  <p className="text-xs font-medium text-teal-700 mt-1">
                    Generic IP Salt: {item.active_salt_ip} ({item.pack_unit})
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="block text-xs text-slate-500">Branded MRP</span>
                    <span className="line-through text-slate-500 font-medium">
                      ₹{item.estimated_brand_mrp_inr}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-xs text-slate-500">Jan Aushadhi</span>
                    <span className="font-bold text-emerald-700 text-base">
                      ₹{item.estimated_jan_aushadhi_mrp_inr}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-slate-500">You Save</span>
                    <span className="font-bold text-slate-900">₹{item.savings_inr}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.pharmacist_note}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 text-center">{result.disclaimer}</p>
        </>
      )}
    </div>
  );
}

export default JanAushadhiSaver;