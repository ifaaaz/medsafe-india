import React from 'react';
import { Link } from 'react-router-dom';
import {
  LogOut,
  User,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-[#031329] via-[#051d3d] to-[#082856] text-white border-b border-sky-400/15 shadow-[0_6px_24px_-6px_rgba(3,19,41,0.55)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-15 sm:h-17 flex items-center justify-between gap-2">
        {/* Brand Logo (Matches Deep Navy Backdrop) */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
          <div className="relative flex items-center justify-center">
            <img
              src="/icon-192.png"
              alt="MedSafe India Shield"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain ring-1 ring-white/15 shadow-[0_4px_14px_rgba(16,185,129,0.28)] group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div>
            <span className="font-extrabold text-white text-base sm:text-lg tracking-tight leading-none block">
              MedSafe <span className="text-emerald-400">India</span>
            </span>
            <span className="text-[10px] text-sky-200/75 hidden sm:block mt-0.5 tracking-wide">
              Clinical Prescription &amp; Generic Safety Suite
            </span>
          </div>
        </Link>

        {/* Active Session Profile + Saved Health Alert + Sign Out */}
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {user.savedConditions.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-200 text-xs font-semibold">
                <HeartPulse className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate max-w-[190px]">
                  Alert Profile: {user.savedConditions.join(', ')}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
              {user.role === 'clinician' ? (
                <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
              )}
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none max-w-[95px] sm:max-w-none truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-sky-200/75 capitalize mt-0.5 hidden sm:block">
                  {user.role}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-rose-500/20 hover:border-rose-400/40 bg-white/5 border border-white/15 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-300" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile-only Saved Health Condition Banner */}
      {user && user.savedConditions.length > 0 && (
        <div className="md:hidden bg-amber-500/15 border-t border-amber-400/25 px-3.5 py-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-200">
          <HeartPulse className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="truncate">Auto-Screening: {user.savedConditions.join(', ')}</span>
        </div>
      )}
    </header>
  );
};