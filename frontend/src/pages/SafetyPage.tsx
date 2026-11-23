import React from 'react';
import { Lock, FileCheck } from 'lucide-react';
import { WarningCard } from '../components/WarningCard';
import { useLanguage } from '../context/LanguageContext';

export const SafetyPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          {t.safetyPageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t.safetyPageSubtitle}
        </p>
      </div>

      <WarningCard type="info" title={t.safetyZeroLlmTitle}>
        {t.safetyZeroLlmBody}
      </WarningCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-2">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">{t.safetyVerifiedSourcesTitle}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t.safetyVerifiedSourcesBody}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-2">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900">{t.safetyOcrGuardrailsTitle}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t.safetyOcrGuardrailsBody}
          </p>
        </div>
      </div>
    </div>
  );
};