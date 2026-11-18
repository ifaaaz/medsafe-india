import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, FileText, Pill, Info, IndianRupee } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive(path)
        ? 'bg-emerald-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1 flex-1">
        <p className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Navigation
        </p>
        <Link to="/checker" className={linkClass('/checker')}>
          <Search className="w-5 h-5" />
          <span>{t.medicineChecker}</span>
        </Link>
        <Link to="/scanner" className={linkClass('/scanner')}>
          <FileText className="w-5 h-5" />
          <span>{t.prescriptionScanner}</span>
        </Link>
        <Link to="/my-medicines" className={linkClass('/my-medicines')}>
          <Pill className="w-5 h-5" />
          <span>{t.myMedicines}</span>
        </Link>
        <Link to="/generic-saver" className={linkClass('/generic-saver')}>
          <IndianRupee className="w-5 h-5" />
          <span>{(t as any).genericSaver || 'Generic Cost Saver'}</span>
        </Link>
        <Link to="/safety" className={linkClass('/safety')}>
          <Info className="w-5 h-5" />
          <span>{t.safetyGuidelines}</span>
        </Link>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-1">{t.clinicalNoticeTitle}</p>
          {t.clinicalNoticeBody}
        </div>
      </div>
    </aside>
  );
};