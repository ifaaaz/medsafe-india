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

// Phonetic transliteration map so Kannada & Hindi TTS engines read medicine names natively
const MEDICINE_TRANSLITERATIONS: Record<string, { kn: string; hi: string }> = {
  'dolo 650': { kn: 'ಡೋಲೋ ೬೫೦', hi: 'डोलो 650' },
  'combiflam': { kn: 'ಕಾಂಬಿಫ್ಲಾಮ್', hi: 'कॉम्बिफ्लाम' },
  'telma 40': { kn: 'ಟೆಲ್ಮಾ ೪೦', hi: 'टेल्मा 40' },
  'pan-d': { kn: 'ಪ್ಯಾನ್ ಡಿ', hi: 'पैन-डी' },
  'pantop 40': { kn: 'ಪ್ಯಾಂಟಾಪ್ ೪೦', hi: 'पैंटॉप 40' },
  'ecosprin 75': { kn: 'ಇಕೋಸ್ಪ್ರಿನ್ ೭೫', hi: 'इकोस्प्रिन 75' },
  'acitrom 2': { kn: 'ಅಸಿಟ್ರೋಮ್ ೨', hi: 'एसिट्रॉम 2' },
  'augmentin 625': { kn: 'ಆಗ್ಮೆಂಟಿನ್ ೬೨೫', hi: 'ऑगमेंटिन 625' },
  'atorva 20': { kn: 'ಅಟೋರ್ವಾ ೨೦', hi: 'अटोर्वा 20' },
  'clopilet 75': { kn: 'ಕ್ಲೋಪಿಲೆಟ್ ೭೫', hi: 'क्लोपिलेट 75' },
  'zerodol-sp': { kn: 'ಝೀರೋಡಾಲ್ ಎಸ್ ಪಿ', hi: 'ज़ीरोडॉल-एसपी' },
  'flagyl 400': { kn: 'ಫ್ಲಾಜಿಲ್ ೪೦೦', hi: 'फ्लैजिल 400' },
  'omez 20': { kn: 'ಓಮೆಜ್ ೨೦', hi: 'ओमेज़ 20' },
  'azithral 500': { kn: 'ಅಜಿತ್ರಾಲ್ ೫೦೦', hi: 'अज़िथ्रल 500' },
  'montair lc': { kn: 'ಮಾಂಟೇರ್ ಎಲ್ ಸಿ', hi: 'मॉन्टेर एलसी' },
};

function localizeMedicineList(medicines: string[], lang: SupportedLang): string {
  if (lang === 'en-IN') return medicines.join(', ');

  return medicines
    .map((med) => {
      const lower = med.toLowerCase();
      for (const [key, scripts] of Object.entries(MEDICINE_TRANSLITERATIONS)) {
        if (lower.includes(key)) {
          return lang === 'kn-IN' ? scripts.kn : scripts.hi;
        }
      }
      return med;
    })
    .join(', ');
}

export const CaregiverAudioSummary: React.FC<CaregiverAudioSummaryProps> = ({
  medicines,
  safetyStatus = 'SAFE',
  interactionsCount = 0,
  interactions = [],
}) => {
  const [activeLang, setActiveLang] = useState<SupportedLang>('en-IN');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  if (medicines.length === 0) return null;

  const hasDanger =
    interactionsCount > 0 ||
    safetyStatus.toUpperCase() === 'DANGER' ||
    safetyStatus.toUpperCase() === 'WARNING';

  const topConflict = interactions[0]
    ? `${interactions[0].ingredient_a} and ${interactions[0].ingredient_b}`
    : '';

  const summaries: Record<SupportedLang, { label: string; badge: string; text: string }> = {
    'en-IN': {
      label: 'English',
      badge: 'EN',
      text: hasDanger
        ? `Caregiver Alert: ${medicines.length} medicines were scanned: ${localizeMedicineList(medicines, 'en-IN')}. Warning: ${interactionsCount} drug interaction detected${topConflict ? ` involving ${topConflict}` : ''}. Do not give these medicines together without consulting the doctor or pharmacist.`
        : `Caregiver Summary: ${medicines.length} medicines were scanned: ${localizeMedicineList(medicines, 'en-IN')}. Good news: no conflicting drug interactions were found. Give each tablet as prescribed after food unless instructed otherwise.`,
    },
    'kn-IN': {
      label: 'ಕನ್ನಡ (Kannada)',
      badge: 'KN',
      text: hasDanger
        ? `ಆರೈಕೆದಾರರ ಎಚ್ಚರಿಕೆ: ಒಟ್ಟು ${medicines.length} ಔಷಧಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ: ${localizeMedicineList(medicines, 'kn-IN')}. ಎಚ್ಚರಿಕೆ: ಈ ಔಷಧಿಗಳಲ್ಲಿ ${interactionsCount} ಅಡ್ಡಪರಿಣಾಮದ ಅಪಾಯ ಕಂಡುಬಂದಿದೆ. ವೈದ್ಯರು ಅಥವಾ ಔಷಧಿಕಾರರ ಸಲಹೆಯಿಲ್ಲದೆ ಇವುಗಳನ್ನು ಒಟ್ಟಿಗೆ ನೀಡಬೇಡಿ.`
        : `ಆರೈಕೆದಾರರ ಸಾರಾಂಶ: ಒಟ್ಟು ${medicines.length} ಔಷಧಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ: ${localizeMedicineList(medicines, 'kn-IN')}. ಯಾವುದೇ ಅಪಾಯಕಾರಿ ಔಷಧಿ ಸಂಘರ್ಷ ಕಂಡುಬಂದಿಲ್ಲ. ವೈದ್ಯರು ಸೂಚಿಸಿದಂತೆ ಆಹಾರದ ನಂತರ ನಿಯಮಿತವಾಗಿ ಔಷಧಿಗಳನ್ನು ನೀಡಿ.`,
    },
    'hi-IN': {
      label: 'हिंदी (Hindi)',
      badge: 'HI',
      text: hasDanger
        ? `देखभालकर्ता चेतावनी: कुल ${medicines.length} दवाइयों की जांच की गई है: ${localizeMedicineList(medicines, 'hi-IN')}. सावधान: इन दवाइयों के बीच ${interactionsCount} गंभीर रिएक्शन पाया गया है। डॉक्टर या फार्मासिस्ट की सलाह के बिना इन्हें एक साथ न दें।`
        : `देखभालकर्ता सारांश: कुल ${medicines.length} दवाइयों की जांच की गई है: ${localizeMedicineList(medicines, 'hi-IN')}. अच्छी खबर: इन दवाइयों के बीच कोई हानिकारक रिएक्शन नहीं पाया गया है। डॉक्टर के निर्देशानुसार समय पर दवाइयां दें।`,
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
    utterance.rate = 0.92;

    const currentVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    const langPrefix = lang.split('-')[0].toLowerCase(); // 'kn', 'hi', or 'en'

    const matchedVoice =
      currentVoices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ||
      currentVoices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
      currentVoices.find((v) => v.name.toLowerCase().includes(langPrefix === 'kn' ? 'kannada' : langPrefix === 'hi' ? 'hindi' : 'india'));

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
      // Clipboard blocked
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