import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  IndianRupee,
  Volume2,
  Stethoscope,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';

const HEALTH_CONDITIONS = [
  'Gastric Ulcer',
  'Kidney Disease',
  'Liver Disease',
  'Pregnancy / Breastfeeding',
  'Alcohol',
];

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('patient');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const toggleCondition = (cond: string) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const displayName =
      name.trim() ||
      (email.includes('@')
        ? email.split('@')[0]
        : role === 'clinician'
        ? 'dr_ananya_rao'
        : 'patient_user');

    login({
      name: displayName,
      email: email.trim() || 'patient@medsafe.in',
      role,
      savedConditions: role === 'patient' ? selectedConditions : [],
    });
    navigate('/scanner');
  };

  const handleInstantDemo = (demoRole: UserRole) => {
    loginAsDemo(demoRole);
    navigate('/scanner');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#031329] text-slate-900">
      {/* Left Clinical Brand & Value Showcase (Desktop Split Panel) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#031329] via-[#062147] to-[#082A59] text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden border-r border-sky-400/15">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-semibold tracking-wide mb-8 backdrop-blur-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>CLINICAL MEDICATION SAFETY PLATFORM • INDIA</span>
          </div>

          {/* Custom Shield & Capsule Logo + Title */}
          <div className="flex items-center gap-4">
            <img
              src="/icon-512.png"
              alt="MedSafe India Shield"
              className="w-16 h-16 xl:w-18 xl:h-18 rounded-2xl object-contain ring-1 ring-white/15 shadow-[0_10px_28px_rgba(14,165,233,0.32)] shrink-0"
            />
            <div>
              <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
                MedSafe <span className="text-emerald-400">India</span>
              </h1>
              <p className="text-xs xl:text-sm text-sky-200/80 font-medium tracking-wide mt-0.5">
                Clinical Prescription &amp; Generic Safety Suite
              </p>
            </div>
          </div>

          <p className="mt-5 text-slate-300 text-base xl:text-lg max-w-xl leading-relaxed">
            AI-powered multi-prescription drug interaction screening, PMBJP Jan Aushadhi generic cost savings, and multilingual caregiver voice guidance.
          </p>

          <div className="mt-9 space-y-4 max-w-lg">
            <div className="p-4 rounded-2xl bg-white/6 border border-white/12 backdrop-blur-xs flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/25 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Cross-Prescription Safety Engine</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Detects hidden drug–drug interactions, duplicate active salts, and condition contraindications across multiple doctors.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/6 border border-white/12 backdrop-blur-xs flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/25 shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Jan Aushadhi Generic Cost Saver</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Matches expensive branded prescriptions to Indian Pharmacopoeia (IP) equivalents with up to 80% MRP savings.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/6 border border-white/12 backdrop-blur-xs flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/25 shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Kannada, Hindi &amp; English Caregiver Voice</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Translates complex pharmacology warnings into clear spoken summaries for elderly patients and families.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-sky-200/65">
          <span>Aligned with Indian Pharmacopoeia (IP) &amp; PMBJP Standards</span>
          <span>Built for Safer Prescriptions</span>
        </div>
      </div>

      {/* Right Authentication & Instant Judge Demo Panel */}
      <div className="flex-1 lg:w-1/2 bg-[#F4F7FB] flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12">
        {/* Compact Mobile Brand Header (Shown on phones/tablets with Navy Hero Card) */}
        <div className="lg:hidden w-full max-w-md mb-5 rounded-2xl bg-gradient-to-r from-[#031329] via-[#062147] to-[#082A59] text-white p-4 shadow-lg border border-sky-400/15 flex items-center gap-3.5">
          <img
            src="/icon-192.png"
            alt="MedSafe India Shield"
            className="w-12 h-12 rounded-xl object-contain ring-1 ring-white/15 shadow-[0_4px_14px_rgba(16,185,129,0.3)] shrink-0"
          />
          <div>
            <div className="font-extrabold text-lg tracking-tight leading-none">
              MedSafe <span className="text-emerald-400">India</span>
            </div>
            <p className="text-[11px] text-sky-200/80 mt-1">
              Prescription Safety • Jan Aushadhi Savings • Voice Care
            </p>
          </div>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_18px_45px_-15px_rgba(4,24,51,0.14)] border border-slate-200/90 p-6 sm:p-9 space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#041833]">
              Sign in to MedSafe
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Personalize drug screening with your health profile or launch an instant demo.
            </p>
          </div>

          {/* Instant Demo Banner for Judges & Evaluators */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-cyan-50/70 to-emerald-50 border border-sky-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#062147]">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Instant Evaluator / Judge Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemo('patient')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>Patient Demo</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemo('clinician')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#041833] hover:bg-[#082A59] text-white text-xs font-semibold shadow-sm shadow-slate-900/20 transition cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <span>Clinician Demo</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>

          <div className="relative flex py-0.5 items-center">
            <div className="grow border-t border-slate-200" />
            <span className="shrink mx-3 text-[11px] font-medium text-slate-400 uppercase">
              or sign in with profile
            </span>
            <div className="grow border-t border-slate-200" />
          </div>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                role === 'patient'
                  ? 'bg-white text-[#041833] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Patient / Caregiver</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('clinician')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                role === 'clinician'
                  ? 'bg-white text-[#041833] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
              <span>Doctor / Pharmacist</span>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            {/* Optional Saved Patient Health Conditions */}
            {role === 'patient' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pre-Existing Conditions (Auto-screened on every scan)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {HEALTH_CONDITIONS.map((cond) => {
                    const active = selectedConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => toggleCondition(cond)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                          active
                            ? 'bg-[#041833] text-white border-[#041833]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {active && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        <span>{cond}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#041833] to-[#082A59] hover:from-[#062147] hover:to-[#0b3875] text-white font-semibold text-sm shadow-md shadow-slate-900/20 transition cursor-pointer"
            >
              Continue to Clinical Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;