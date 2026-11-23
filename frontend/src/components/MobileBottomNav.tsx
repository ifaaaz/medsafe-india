import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  FileText,
  ShieldAlert,
  IndianRupee,
  Pill,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const MobileBottomNav: React.FC = () => {
  const { t } = useLanguage();

  const tabs = [
    { to: '/', label: t.mobileNavHome, icon: Home, end: true },
    { to: '/scanner', label: t.mobileNavScanner, icon: FileText },
    { to: '/checker', label: t.mobileNavChecker, icon: ShieldAlert },
    { to: '/generic-saver', label: t.mobileNavSave, icon: IndianRupee },
    { to: '/my-medicines', label: t.mobileNavMyMeds, icon: Pill },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 shadow-[0_-8px_28px_-6px_rgba(4,24,51,0.12)]"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.35rem)' }}
    >
      <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-br from-[#041833] to-[#082A59] text-white font-bold shadow-sm shadow-slate-900/20 ring-1 ring-sky-400/25'
                  : 'text-slate-500 hover:text-[#041833] active:bg-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-5 h-5 mb-0.5 shrink-0 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate max-w-full">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};