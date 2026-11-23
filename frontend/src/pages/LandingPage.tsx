import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Pill,
  IndianRupee,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { WarningCard } from '../components/WarningCard';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-8 sm:space-y-10 pb-12">
      {/* Deep Clinical Navy Hero Banner (Matches Custom Shield & Capsule Logo) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#031329] via-[#062147] to-[#082A59] text-white p-6 sm:p-11 shadow-[0_20px_50px_-15px_rgba(3,19,41,0.55)] border border-sky-400/15">
        {/* Subtle Clinical Glow Orbs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-5 backdrop-blur-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t.heroBadgeText}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12] mb-4">
              {t.heroTitlePrefix}{' '}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                {t.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-lg mb-7 leading-relaxed max-w-xl">
              {t.heroSubtitle}
            </p>

            {/* Integrated Search Bar */}
            <div className="max-w-xl bg-white/10 p-1.5 rounded-2xl border border-white/15 backdrop-blur-sm">
              <SearchBar onSearch={(q) => navigate(`/checker?q=${encodeURIComponent(q)}`)} />
            </div>

            {/* Quick Action Pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-sky-200/70 font-medium">{t.heroQuickJumpLabel}</span>
              <button
                type="button"
                onClick={() => navigate('/scanner')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 font-semibold transition cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                {t.heroScanRxPill}
              </button>
              <button
                type="button"
                onClick={() => navigate('/generic-saver')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-200 font-semibold transition cursor-pointer"
              >
                <IndianRupee className="w-3 h-3" />
                {t.heroJanAushadhiPill}
              </button>
            </div>
          </div>

          {/* Right-Side Brand Emblem Showcase Card */}
          <div className="hidden lg:flex flex-col items-center justify-center shrink-0 bg-white/5 border border-white/15 rounded-3xl p-7 backdrop-blur-md shadow-inner">
            <img
              src="/icon-512.png"
              alt="MedSafe India Emblem"
              className="w-28 h-28 object-contain drop-shadow-[0_10px_25px_rgba(14,165,233,0.35)]"
            />
            <span className="mt-3 text-sm font-bold text-white tracking-tight">
              MedSafe <span className="text-emerald-400">India</span>
            </span>
            <span className="text-[11px] text-sky-200/75 mt-0.5">
              {t.heroEngineSubtitle}
            </span>
          </div>
        </div>
      </section>

      {/* Safety Notice Banner */}
      <WarningCard type="warning" title={t.heroSafetyMandateTitle}>
        {t.heroSafetyMandateBody}
      </WarningCard>

      {/* Feature Grid (Elevated White Cards on Ice-Slate Canvas) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Brand & Salt Search */}
        <div
          onClick={() => navigate('/checker')}
          className="group bg-white border border-slate-200/90 p-6 rounded-2xl hover:border-sky-300 hover:-translate-y-1 transition-all duration-200 shadow-[0_10px_30px_-12px_rgba(4,24,51,0.08)] hover:shadow-[0_18px_36px_-12px_rgba(14,165,233,0.18)] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="p-3 bg-sky-50 text-sky-600 ring-1 ring-sky-200/70 rounded-xl w-fit mb-4 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              {t.card1Title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.card1Desc}
            </p>
          </div>
          <div className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-sky-600 group-hover:translate-x-1 transition-transform">
            <span>{t.card1Action}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Prescription OCR */}
        <div
          onClick={() => navigate('/scanner')}
          className="group bg-white border border-slate-200/90 p-6 rounded-2xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-200 shadow-[0_10px_30px_-12px_rgba(4,24,51,0.08)] hover:shadow-[0_18px_36px_-12px_rgba(16,185,129,0.18)] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="p-3 bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70 rounded-xl w-fit mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              {t.card2Title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.card2Desc}
            </p>
          </div>
          <div className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
            <span>{t.card2Action}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Duplicate & Interaction Check */}
        <div
          onClick={() => navigate('/my-medicines')}
          className="group bg-white border border-slate-200/90 p-6 rounded-2xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 shadow-[0_10px_30px_-12px_rgba(4,24,51,0.08)] hover:shadow-[0_18px_36px_-12px_rgba(79,70,229,0.16)] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="p-3 bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/70 rounded-xl w-fit mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              {t.card3Title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.card3Desc}
            </p>
          </div>
          <div className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
            <span>{t.card3Action}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Jan Aushadhi Generic Saver */}
        <div
          onClick={() => navigate('/generic-saver')}
          className="group bg-white border border-slate-200/90 p-6 rounded-2xl hover:border-teal-300 hover:-translate-y-1 transition-all duration-200 shadow-[0_10px_30px_-12px_rgba(4,24,51,0.08)] hover:shadow-[0_18px_36px_-12px_rgba(13,148,136,0.18)] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="p-3 bg-teal-50 text-teal-600 ring-1 ring-teal-200/70 rounded-xl w-fit mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <IndianRupee className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
              {t.card4Title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.card4Desc}
            </p>
          </div>
          <div className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
            <span>{t.card4Action}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </section>
    </div>
  );
};