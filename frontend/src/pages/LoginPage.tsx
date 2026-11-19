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
        ? 'Dr. Ananya Rao'
        : 'Patient User');

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-900">
      {/* Left Clinical Brand & Value Showcase (Desktop Split Panel) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-950 via-emerald-950 to-slate-950 text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide mb-8">
            <ShieldCheck className="w-4 h-4" />
            <span>CLINICAL MEDICATION SAFETY PLATFORM • INDIA</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
            MedSafe <span className="text-emerald-400">India</span>
          </h1>
          <p className="mt-4 text-slate-300 text-lg max-w-xl leading-relaxed">
            AI-powered multi-prescription drug interaction screening, PMBJP Jan Aushadhi generic cost savings, and multilingual caregiver voice guidance.
          </p>

          <div className="mt-10 space-y-4 max-w-lg">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Cross-Prescription Safety Engine</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Detects hidden drug-drug interactions, duplicate active salts, and condition contraindications across multiple doctors.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Jan Aushadhi Generic Cost Saver</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Matches expensive branded prescriptions to Indian Pharmacopoeia (IP) equivalents with up to 80% MRP savings.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
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

        <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Aligned with Indian Pharmacopoeia (IP) &amp; PMBJP Standards</span>
          <span>Built for Safer Prescriptions</span>
        </div>
      </div>

      {/* Right Authentication & Instant Judge Demo Panel */}
      <div className="flex-1 lg:w-1/2 bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12">
        {/* Compact Mobile Brand Header (Shown only on phones/tablets) */}
        <div className="lg:hidden w-full max-w-md mb-5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-900 text-emerald-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>MedSafe India</span>
          </div>
          <p className="text-xs text-slate-600">
            Prescription Safety • Jan Aushadhi Savings • Multilingual Voice
          </p>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/80 p-6 sm:p-9 space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Sign in to MedSafe</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Personalize drug screening with your health profile or launch an instant demo.
            </p>
          </div>

          {/* Instant Demo Banner for Judges & Evaluators */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Evaluator / Judge Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemo('patient')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>Patient Demo</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => handleInstantDemo('clinician')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5 shrink-0" />
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
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                role === 'patient'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient / Caregiver</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('clinician')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                role === 'clinician'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor / Pharmacist</span>
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'clinician' ? 'Dr. R. Shenoy' : 'e.g. Rajesh Kumar'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
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
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                          active
                            ? 'bg-teal-700 text-white border-teal-700'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {active && <CheckCircle2 className="w-3 h-3" />}
                        <span>{cond}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md shadow-teal-700/20 transition cursor-pointer"
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