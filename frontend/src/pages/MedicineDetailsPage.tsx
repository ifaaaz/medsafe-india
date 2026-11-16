import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Layers, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { WarningCard } from '../components/WarningCard';

export const MedicineDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back
      </button>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-start border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">Crocin Advance 650</h1>
              <StatusBadge status="safe" label="Tablet" />
            </div>
            <p className="text-sm text-slate-500">ID: #{id || '1'} • Verified Indian Brand</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Manufacturer</span>
            <span className="font-semibold text-slate-800 text-sm">GSK Pharmaceuticals India</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Active Ingredient</span>
            <span className="font-bold text-slate-800">Paracetamol (Acetaminophen)</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">Strength & Form</span>
            <span className="font-bold text-slate-800">650mg Tablet</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Plain-Language Explanation (Verified Source)</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Paracetamol is a widely used mild analgesic (pain reliever) and antipyretic (fever reducer). It acts on the brain centers to regulate body temperature and reduce pain signals.
          </p>
        </div>

        <WarningCard type="info" title="Patient Safety Reminder">
          Never alter your dosage or stop prescribed medications without consulting a qualified medical professional.
        </WarningCard>
      </div>
    </div>
  );
};