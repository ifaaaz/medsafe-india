import React from "react";
import { Globe } from "lucide-react";
import { useLanguage, AppLanguage } from "../context/LanguageContext";

const OPTIONS: { code: AppLanguage; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिंदी" },
  { code: "kn", label: "ಕನ್ನಡ" },
];

export const LanguageToggle: React.FC = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full p-1 shadow-sm"
      role="group"
      aria-label="Language Switcher"
    >
      <Globe className="w-4 h-4 text-teal-600 ml-2 mr-1" />
      {OPTIONS.map((opt) => {
        const active = lang === opt.code;
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLang(opt.code)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              active
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};