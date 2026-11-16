import React from 'react';
import { ShieldCheck, Lock, Cpu, FileCheck } from 'lucide-react';
import { WarningCard } from '../components/WarningCard';

export const SafetyPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clinical Safety & Guardrails</h1>
        <p className="text-sm text-slate-500 mt-1">Understand how MedSafe India guarantees medical safety and strict data integrity.</p>
      </div>

      <WarningCard type="info" title="Zero LLM Medical Decision Rule">
        MedSafe India strictly prohibits Large Language Models from generating or deciding medicine facts, drug-drug interactions, or dosage instructions. LLMs are exclusively restricted to translating pre-verified structured facts into simpler language.
      </WarningCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-2">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">Structured Verified Sources</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            All brand names, active salts, strengths, and manufacturers originate exclusively from verified Indian pharmaceutical datasets.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-2">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">Uncertain OCR Guardrails</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Optical Character Recognition outputs are treated strictly as hypotheses until explicit user confirmation is provided.
          </p>
        </div>
      </div>
    </div>
  );
};