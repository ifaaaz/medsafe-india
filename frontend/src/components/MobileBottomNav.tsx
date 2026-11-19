import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  FileText,
  ShieldAlert,
  IndianRupee,
  Pill,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const tabs = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/scanner', label: 'Scanner', icon: FileText },
    { to: '/checker', label: 'Checker', icon: ShieldAlert },
    { to: '/generic-saver', label: 'Save 80%', icon: IndianRupee },
    { to: '/my-medicines', label: 'My Meds', icon: Pill },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1.5 py-1.5 shadow-[0_-4px_20px_rgba(15,23,42,0.08)]"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.35rem)' }}
    >
      <div className="grid grid-cols-5 gap-0.5 max-w-lg mx-auto">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-semibold transition ${
                isActive
                  ? 'text-teal-700 bg-teal-50 font-bold'
                  : 'text-slate-500 hover:text-slate-900 active:bg-slate-100'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5 shrink-0" />
            <span className="truncate max-w-full">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};