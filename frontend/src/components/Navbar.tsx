import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Search, FileText, Pill, AlertTriangle, Info, Globe } from 'lucide-react';
import { useLanguage, LanguageCode } from '../context/LanguageContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-emerald-50 text-emerald-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'हिंदी' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-emerald-600 text-white rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900">
                MedSafe <span className="text-emerald-600">India</span>
              </span>
            </Link>

            <nav className="hidden md:flex space-x-1">
              <Link to="/checker" className={navLinkClass('/checker')}>
                <Search className="w-4 h-4" />
                <span>{t.medicineChecker}</span>
              </Link>
              <Link to="/scanner" className={navLinkClass('/scanner')}>
                <FileText className="w-4 h-4" />
                <span>{t.prescriptionScanner}</span>
              </Link>
              <Link to="/my-medicines" className={navLinkClass('/my-medicines')}>
                <Pill className="w-4 h-4" />
                <span>{t.myMedicines}</span>
              </Link>
              <Link to="/safety" className={navLinkClass('/safety')}>
                <Info className="w-4 h-4" />
                <span>{t.safetyGuidelines}</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {/* 3-Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    lang === item.code
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <span className="hidden xl:inline-flex items-center text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              Verified Data Only • No AI Dosage Advice
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};