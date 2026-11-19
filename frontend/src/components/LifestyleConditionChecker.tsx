import React, { useState, useEffect } from 'react';
import { Utensils, Wine, Baby, HeartPulse, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';

interface ConditionAlert {
  medicine_name: string;
  factor: string;
  severity: 'CONTRAINDICATED' | 'HIGH_RISK' | 'MODERATE_CAUTION';
  warning_summary: string;
  actionable_advice: string;
}

interface FoodTimingTip {
  medicine_name: string;
  timing_instruction: string;
  food_avoidance: string;
}

interface LifestyleWarningResponse {
  condition_alerts: ConditionAlert[];
  food_timing_tips: FoodTimingTip[];
  overall_lifestyle_note: string;
}

interface LifestyleConditionCheckerProps {
  medicines: string[];
  initialConditions?: string[];
}

const CONDITION_PILLS = [
  { id: 'Alcohol', label: 'Alcohol Use', icon: Wine },
  { id: 'Pregnancy / Breastfeeding', label: 'Pregnancy', icon: Baby },
  { id: 'Kidney Disease', label: 'Kidney Disease', icon: HeartPulse },
  { id: 'Liver Disease', label: 'Liver Disease', icon: ShieldAlert },
  { id: 'Gastric Ulcer', label: 'Gastric Ulcer / Acidity', icon: Utensils },
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const LifestyleConditionChecker: React.FC<LifestyleConditionCheckerProps> = ({
  medicines,
  initialConditions = [],
}) => {
  const [selectedConditions, setSelectedConditions] = useState<string[]>(initialConditions);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LifestyleWarningResponse | null>(null);

  // Sync automatically if the logged-in user has saved health conditions
  useEffect(() => {
    if (initialConditions.length > 0) {
      setSelectedConditions((prev) => Array.from(new Set([...prev, ...initialConditions])));
    }
  }, [initialConditions.join(',')]);

  const toggleCondition = (conditionId: string) => {
    setSelectedConditions((prev) =>
      prev.includes(conditionId)
        ? prev.filter((c) => c !== conditionId)
        : [...prev, conditionId]
    );
  };

  useEffect(() => {
    if (medicines.length === 0) {
      setData(null);
      return;
    }

    const fetchLifestyleWarnings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/v1/lifestyle-warnings/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medicines,
            conditions: selectedConditions,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.detail || `Error ${res.status}`);
        }

        const result: LifestyleWarningResponse = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Could not load food & condition warnings.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce slightly so clicking multiple pills triggers one clean API call
    const timer = setTimeout(fetchLifestyleWarnings, 400);
    return () => clearTimeout(timer);
  }, [medicines.join(','), selectedConditions.join(',')]);

  if (medicines.length === 0) return null;

  const severityBadge = (severity: ConditionAlert['severity']) => {
    if (severity === 'CONTRAINDICATED') {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (severity === 'HIGH_RISK') {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Food Timing, Alcohol &amp; Patient Condition Check</span>
            </h3>
            {initialConditions.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                Auto-linked from Patient Profile
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Toggle patient conditions below to screen for hidden contraindications alongside meal timing rules
          </p>
        </div>
        {loading && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Screening factors...
          </span>
        )}
      </div>

      {/* Interactive Condition Toggle Pills */}
      <div className="flex flex-wrap gap-2">
        {CONDITION_PILLS.map(({ id, label, icon: Icon }) => {
          const active = selectedConditions.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleCondition(id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                active
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-3">
          {/* Condition-Specific Contraindication Alerts */}
          {selectedConditions.length > 0 && (
            <div className="space-y-2">
              {data.condition_alerts.length === 0 ? (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    No major contraindications flagged for{' '}
                    <strong>{selectedConditions.join(', ')}</strong> across these medicines.
                  </span>
                </div>
              ) : (
                data.condition_alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white border border-red-200 shadow-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {alert.medicine_name} + {alert.factor}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${severityBadge(
                          alert.severity
                        )}`}
                      >
                        {alert.severity.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{alert.warning_summary}</p>
                    <p className="text-xs font-medium text-slate-900">
                      Action: {alert.actionable_advice}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Food & Meal Timing Guidance */}
          {data.food_timing_tips.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Food &amp; Meal Timing Schedule
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.food_timing_tips.map((tip, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <p className="font-bold text-slate-800">{tip.medicine_name}</p>
                    <p className="text-emerald-700 font-medium mt-0.5">{tip.timing_instruction}</p>
                    {tip.food_avoidance && tip.food_avoidance.toLowerCase() !== 'none' && (
                      <p className="text-amber-700 mt-0.5">Avoid: {tip.food_avoidance}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};