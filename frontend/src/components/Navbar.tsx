import React from 'react';
import { Link } from 'react-router-dom';
import {
  LogOut,
  User,
  Stethoscope,
  HeartPulse,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, AppLanguage } from '../context/LanguageContext';

const LANGUAGE_OPTIONS: { code: AppLanguage; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();

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
              {t('navSubtitle')}
            </span>
          </div>
        </Link>

        {/* Right Controls: Language Toggle + Active Session Profile + Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Top-Bar Language Switcher (EN | हिंदी | ಕನ್ನಡ) */}
          <div
            className="inline-flex items-center gap-0.5 bg-white/10 border border-white/15 rounded-full p-0.5 sm:p-1 shrink-0"
            role="group"
            aria-label="Language Switcher"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 ml-1.5 mr-0.5 hidden sm:block shrink-0" />
            {LANGUAGE_OPTIONS.map((item) => {
              const isActive = lang === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  className={`px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-sky-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {user && (
            <>
              {user.savedConditions.length > 0 && (
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/15 border border-amber-300/30 text-amber-200 text-xs font-semibold">
                  <HeartPulse className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate max-w-[180px]">
                    {t('alertProfile')}: {user.savedConditions.join(', ')}
                  </span>
                </div>
              )}

              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs">
                {user.role === 'clinician' ? (
                  <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-300 shrink-0" />
                ) : (
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
                )}
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-none max-w-[95px] sm:max-w-none truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-sky-200/75 capitalize mt-0.5">
                    {user.role === 'clinician' ? t('roleClinician') : t('rolePatient')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title={t('signOut')}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-rose-500/20 hover:border-rose-400/40 bg-white/5 border border-white/15 transition cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300" />
                <span className="hidden md:inline">{t('signOut')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile-only Saved Health Condition Banner */}
      {user && user.savedConditions.length > 0 && (
        <div className="lg:hidden bg-amber-500/15 border-t border-amber-400/25 px-3.5 py-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-200">
          <HeartPulse className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="truncate">
            {t('autoScreening')}: {user.savedConditions.join(', ')}
          </span>
        </div>
      )}
    </header>
  );
};