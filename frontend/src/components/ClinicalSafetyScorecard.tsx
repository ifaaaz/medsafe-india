import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Printer, Stethoscope, Pill } from 'lucide-react';

interface ClinicalSafetyScorecardProps {
  prescriptions: any[];
  combinedAnalysis: any;
  allBrands: string[];
}

export const ClinicalSafetyScorecard: React.FC<ClinicalSafetyScorecardProps> = ({
  prescriptions,
  combinedAnalysis,
  allBrands,
}) => {
  if (!combinedAnalysis || allBrands.length === 0) return null;

  const interactions = combinedAnalysis.interactions || [];
  const majorCount = interactions.filter((i: any) =>
    ['major', 'high', 'severe', 'contraindicated'].includes((i.severity || '').toLowerCase())
  ).length;
  const moderateCount = interactions.filter(
    (i: any) => (i.severity || '').toLowerCase() === 'moderate'
  ).length;
  const minorCount = Math.max(0, interactions.length - majorCount - moderateCount);

  // Detect duplicate active ingredients across scanned prescriptions
  const ingredientCounts: Record<string, number> = {};
  prescriptions.forEach((rx) => {
    rx.medicines?.forEach((med: any) => {
      const ings = med.active_ingredients || med.ingredients || [];
      ings.forEach((ing: any) => {
        const name = (typeof ing === 'string' ? ing : ing.name || '').trim().toLowerCase();
        if (name) ingredientCounts[name] = (ingredientCounts[name] || 0) + 1;
      });
    });
  });
  const duplicateSalts = Object.entries(ingredientCounts)
    .filter(([, count]) => count > 1)
    .map(([name]) => name.replace(/\b\w/g, (c) => c.toUpperCase()));

  // Deterministic clinical risk index (100 = Safe, 10 = Critical Risk)
  const rawScore =
    100 - majorCount * 35 - duplicateSalts.length * 25 - moderateCount * 15 - minorCount * 5;
  const safetyScore = Math.max(10, Math.min(100, rawScore));

  const isCritical = safetyScore < 50;
  const isCaution = safetyScore >= 50 && safetyScore < 85;

  const statusLabel = isCritical
    ? 'CRITICAL RISK — DOCTOR REVIEW REQUIRED'
    : isCaution
    ? 'MODERATE CAUTION — MONITOR & VERIFY TIMING'
    : 'REGIMEN VERIFIED — NO MAJOR CONFLICTS';

  const ringColor = isCritical ? '#e11d48' : isCaution ? '#d97706' : '#059669';
  const badgeClasses = isCritical
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : isCaution
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safetyScore / 100) * circumference;

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5 shadow-xs print:border-slate-400">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: SVG Radial Safety Gauge + Executive Clinical Verdict */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 84 84">
              <circle
                cx="42"
                cy="42"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="42"
                cy="42"
                r={radius}
                stroke={ringColor}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-slate-900 leading-none">
                {safetyScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400 mt-0.5">/ 100</span>
            </div>
          </div>

          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border mb-1.5 ${badgeClasses}`}
            >
              {isCritical ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : isCaution ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              {statusLabel}
            </span>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
              Deterministic Regimen Safety Index
            </h3>

            <p className="text-xs text-slate-600 mt-0.5">
              <strong>{allBrands.length}</strong> medicines evaluated •{' '}
              <span className="text-rose-600 font-semibold">{majorCount} Major</span> •{' '}
              <span className="text-amber-600 font-semibold">{moderateCount} Moderate</span> •{' '}
              <span className="text-purple-700 font-semibold">
                {duplicateSalts.length} Duplicate Salts
              </span>
            </p>
          </div>
        </div>

        {/* Right: One-Click Doctor / Pharmacist Consultation Handover Print */}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition cursor-pointer shrink-0 print:hidden"
        >
          <Printer className="w-4 h-4" />
          Print / Save Doctor Handover
        </button>
      </div>

      {/* Duplicate Salt Alert Strip (if stacked salts detected) */}
      {duplicateSalts.length > 0 && (
        <div className="mt-3 px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
          <strong>⚠️ Duplicate Active Salt Alert:</strong>{' '}
          {duplicateSalts.join(', ')} detected across multiple entries — verify cumulative daily dosage to prevent overdose.
        </div>
      )}

      {/* Active Medicines Verified Strip */}
      <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mr-1">
          <Pill className="w-3.5 h-3.5 text-teal-600" />
          Verified Regimen:
        </span>
        {allBrands.map((brand, idx) => (
          <span
            key={idx}
            className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-white text-slate-800 border border-slate-200"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
};