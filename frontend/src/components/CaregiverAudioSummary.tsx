import React, { useState, useEffect } from 'react';
import { Volume2, Square, Copy, Check, Users } from 'lucide-react';

interface CaregiverAudioSummaryProps {
  medicines: string[];
  safetyStatus?: string;
  interactionsCount?: number;
  interactions?: Array<{
    ingredient_a: string;
    ingredient_b: string;
    severity?: string;
    interaction_description?: string;
  }>;
}

type SupportedLang = 'en-IN' | 'kn-IN' | 'hi-IN';

export const CaregiverAudioSummary: React.FC<CaregiverAudioSummaryProps> = ({
  medicines,
  safetyStatus = 'SAFE',
  interactionsCount = 0,
  interactions = [],
}) => {
  const [activeLang, setActiveLang] = useState<SupportedLang>('en-IN');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Stop speech cleanly if component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (medicines.length === 0) return null;

  const medListText = medicines.join(', ');
  const hasDanger = interactionsCount > 0 || safetyStatus.toUpperCase() === 'DANGER' || safetyStatus.toUpperCase() === 'WARNING';

  const topConflict = interactions[0]
    ? `${interactions[0].ingredient_a} and ${interactions[0].ingredient_b}`
    : '';

  // Plain-language Caregiver Summaries in English, Kannada, and Hindi
  const summaries: Record<SupportedLang, { label: string; badge: string; text: string }> = {
    'en-IN': {
      label: 'English',
      badge: 'EN',
      text: hasDanger
        ? `Caregiver Alert: ${medicines.length} medicines were scanned: ${medListText}. Warning: ${interactionsCount} drug interaction detected${topConflict ? ` involving ${topConflict}` : ''}. Do not give these medicines together without consulting the doctor or pharmacist.`
        : `Caregiver Summary: ${medicines.length} medicines were scanned: ${medListText}. Good news: no conflicting drug interactions were found. Give each tablet as prescribed after food unless instructed otherwise.`,
    },
    'kn-IN': {
      label: 'ಕನ್ನಡ (Kannada)',
      badge: 'KN',
      text: hasDanger
        ? `ಆರೈಕೆದಾರರ ಎಚ್ಚರಿಕೆ: ಒಟ್ಟು ${medicines.length} ಔಷಧಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ: ${medListText}. ಎಚ್ಚರಿಕೆ: ಈ ಔಷಧಿಗಳಲ್ಲಿ ${interactionsCount} ಅಡ್ಡಪರಿಣಾಮದ ಅಪಾಯ ಕಂಡುಬಂದಿದೆ. ವೈದ್ಯರು ಅಥವಾ ಔಷಧಿಕಾರರ ಸಲಹೆಯಿಲ್ಲದೆ ಇವುಗಳನ್ನು ಒಟ್ಟಿಗೆ ನೀಡಬೇಡಿ.`
        : `ಆರೈಕೆದಾರರ ಸಾರಾಂಶ: ಒಟ್ಟು ${medicines.length} ಔಷಧಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ: ${medListText}. ಯಾವುದೇ ಅಪಾಯಕಾರಿ ಔಷಧಿ ಸಂಘರ್ಷ ಕಂಡುಬಂದಿಲ್ಲ. ವೈದ್ಯರು ಸೂಚಿಸಿದಂತೆ ಆಹಾರದ ನಂತರ ನಿಯಮಿತವಾಗಿ ಔಷಧಿಗಳನ್ನು ನೀಡಿ.`,
    },
    'hi-IN': {
      label: 'हिंदी (Hindi)',
      badge: 'HI',
      text: hasDanger
        ? `देखभालकर्ता चेतावनी: कुल ${medicines.length} दवाइयों की जांच की गई है: ${medListText}. सावधान: इन दवाइयों के बीच ${interactionsCount} गंभीर रिएक्शन पाया गया है। डॉक्टर या फार्मासिस्ट की सलाह के बिना इन्हें एक साथ न दें।`
        : `देखभालकर्ता सारांश: कुल ${medicines.length} दवाइयों की जांच की गई है: ${medListText}. अच्छी खबर: इन दवाइयों के बीच कोई हानिकारक रिएक्शन नहीं पाया गया है। डॉक्टर के निर्देशानुसार समय पर दवाइयां दें।`,
    },
  };

  const handleSpeak = (lang: SupportedLang) => {
    setActiveLang(lang);

    if (!('speechSynthesis' in window)) {
      alert('Voice readout is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(summaries[lang].text);
    utterance.lang = lang;
    utterance.rate = 0.92; // Slightly slower pace for elderly patients & caregivers

    // Prefer an exact regional voice if installed on Windows/Android
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().includes(lang.toLowerCase()));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaries[activeLang].text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  return (
    <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/60 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
            <Users className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-indigo-950">
              Caregiver Summary &amp; Voice Readout
            </h3>
            <p className="text-xs text-indigo-700">
              Listen in English, Kannada, or Hindi for elderly patients &amp; family caregivers
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.keys(summaries) as SupportedLang[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => handleSpeak(lang)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeLang === lang && isSpeaking
                  ? 'bg-indigo-700 text-white ring-2 ring-indigo-300'
                  : activeLang === lang
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-white text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{summaries[lang].label}</span>
            </button>
          ))}

          {isSpeaking && (
            <button
              type="button"
              onClick={handleStop}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* Readable Caregiver Script Box */}
      <div className="p-3 rounded-lg bg-white border border-indigo-100 flex items-start justify-between gap-3">
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {summaries[activeLang].text}
        </p>
        <button
          type="button"
          onClick={handleCopySummary}
          title="Copy caregiver summary to share on WhatsApp"
          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};