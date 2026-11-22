import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, FileText, Pill, Info, IndianRupee, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `group flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
      isActive(path)
        ? 'bg-gradient-to-r from-[#041833] to-[#082A59] text-white shadow-[0_6px_18px_-4px_rgba(4,24,51,0.35)] ring-1 ring-sky-400/25'
        : 'text-slate-600 hover:bg-sky-50/70 hover:text-[#041833]'
    }`;

  const iconClass = (path: string) =>
    `w-5 h-5 shrink-0 transition-colors ${
      isActive(path)
        ? 'text-emerald-400'
        : 'text-slate-400 group-hover:text-sky-600'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 hidden lg:flex flex-col p-4 shrink-0 min-h-[calc(100vh-4.25rem)] shadow-[4px_0_24px_-12px_rgba(4,24,51,0.06)]">
      <div className="space-y-1.5 flex-1">
        <p className="px-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Clinical Workspace
        </p>

        <Link to="/checker" className={linkClass('/checker')}>
          <Search className={iconClass('/checker')} />
          <span>{t.medicineChecker}</span>
        </Link>

        <Link to="/scanner" className={linkClass('/scanner')}>
          <FileText className={iconClass('/scanner')} />
          <span>{t.prescriptionScanner}</span>
        </Link>

        <Link to="/my-medicines" className={linkClass('/my-medicines')}>
          <Pill className={iconClass('/my-medicines')} />
          <span>{t.myMedicines}</span>
        </Link>

        <Link to="/generic-saver" className={linkClass('/generic-saver')}>
          <IndianRupee className={iconClass('/generic-saver')} />
          <span>{(t as any).genericSaver || 'Generic Cost Saver'}</span>
        </Link>

        <Link to="/safety" className={linkClass('/safety')}>
          <Info className={iconClass('/safety')} />
          <span>{t.safetyGuidelines}</span>
        </Link>
      </div>

      {/* Clinical Notice Card */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#041833] to-[#082A59] text-white border border-sky-400/20 shadow-sm">
          <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t.clinicalNoticeTitle}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {t.clinicalNoticeBody}
          </p>
        </div>
      </div>
    </aside>
  );
};