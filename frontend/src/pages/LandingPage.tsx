import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, FileText, Pill, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { WarningCard } from '../components/WarningCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-800/80 text-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Indian Medicine Safety & Interaction Checker</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Safe Medication Choices for India
          </h1>
          <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
            Verify Indian medicine brands, resolve active ingredients, detect duplicate salts, and check deterministic drug-drug interactions with absolute data reliability.
          </p>

          <div className="max-w-xl">
            <SearchBar onSearch={(q) => navigate(`/checker?q=${encodeURIComponent(q)}`)} />
          </div>
        </div>
      </section>

      {/* Safety Notice Banner */}
      <WarningCard type="warning" title="Clinical Safety Mandate">
        MedSafe India relies entirely on structured verified pharmaceutical databases. LLMs are never used to decide drug interactions or prescribe dosages. OCR results are treated as uncertain until confirmed by you.
      </WarningCard>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/checker')}
          className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-slate-300 transition shadow-sm cursor-pointer"
        >
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Brand & Salt Search</h3>
          <p className="text-sm text-slate-600">
            Instantly map Indian medicine brand names to their active generic ingredients, strengths, and manufacturers.
          </p>
        </div>

        <div 
          onClick={() => navigate('/scanner')}
          className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-slate-300 transition shadow-sm cursor-pointer"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Prescription OCR</h3>
          <p className="text-sm text-slate-600">
            Upload prescriptions for scanned medicine extraction with mandatory user confirmation safeguards.
          </p>
        </div>

        <div 
          onClick={() => navigate('/my-medicines')}
          className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-slate-300 transition shadow-sm cursor-pointer"
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit mb-4">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Duplicate & Interaction Check</h3>
          <p className="text-sm text-slate-600">
            Detect duplicate active ingredients across multiple prescriptions and prevent adverse drug interactions.
          </p>
        </div>
      </section>
    </div>
  );
};