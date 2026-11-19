import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  LogOut,
  User,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-teal-700 text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-none block">
              MedSafe <span className="text-emerald-600">India</span>
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:block mt-0.5">
              Clinical Prescription &amp; Generic Safety Suite
            </span>
          </div>
        </Link>

        {/* Active Session Profile + Saved Health Alert + Sign Out */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {user.savedConditions.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                <HeartPulse className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate max-w-[180px]">
                  Alert Profile: {user.savedConditions.join(', ')}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
              {user.role === 'clinician' ? (
                <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-700 shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-700 shrink-0" />
              )}
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-none max-w-[95px] sm:max-w-none truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 capitalize mt-0.5 hidden sm:block">
                  {user.role}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile-only Saved Health Condition Banner */}
      {user && user.savedConditions.length > 0 && (
        <div className="md:hidden bg-amber-50 border-t border-amber-200 px-3.5 py-1 flex items-center gap-1.5 text-[11px] font-semibold text-amber-900">
          <HeartPulse className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">Auto-Screening: {user.savedConditions.join(', ')}</span>
        </div>
      )}
    </header>
  );
};