import React, { createContext, useContext, useState } from 'react';

export type LanguageCode = 'en' | 'kn' | 'hi';

interface Translations {
  medicineChecker: string;
  prescriptionScanner: string;
  myMedicines: string;
  safetyGuidelines: string;
  checkerTitle: string;
  checkerSubtitle: string;
  searchLabel: string;
  searchPlaceholder: string;
  checkUsesBtn: string;
  searchingBtn: string;
  primaryUses: string;
  activeIngredients: string;
  genericComposition: string;
  historyTitle: string;
  historySubtitle: string;
  addMedicineBtn: string;
  clearAllBtn: string;
  deleteBtn: string;
  clinicalNoticeTitle: string;
  clinicalNoticeBody: string;
}

const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    medicineChecker: 'Medicine Checker',
    prescriptionScanner: 'Prescription Scanner',
    myMedicines: 'My Medicines',
    safetyGuidelines: 'Safety Guidelines',
    checkerTitle: 'Medicine & Brand Checker',
    checkerSubtitle: 'Search any Indian medicine brand or generic salt to view its therapeutic uses, active ingredients, and safety details.',
    searchLabel: 'Search Medicine Brand or Generic Name',
    searchPlaceholder: 'e.g., Dolo 650, Augmentin 625, Telma 40...',
    checkUsesBtn: 'Check Uses',
    searchingBtn: 'Searching...',
    primaryUses: 'Primary Uses & Clinical Indications',
    activeIngredients: 'Active Chemical Ingredients',
    genericComposition: 'Generic Composition',
    historyTitle: 'My Medicines & History',
    historySubtitle: 'Automatically tracks your searched and scanned medications and checks duplicate active salts.',
    addMedicineBtn: '+ Add Medicine',
    clearAllBtn: 'Clear All History',
    deleteBtn: 'Delete',
    clinicalNoticeTitle: 'Clinical Safety Notice',
    clinicalNoticeBody: 'OCR results and drug interactions are verified deterministically. Always consult your physician.',
  },
  kn: {
    medicineChecker: 'ಔಷಧಿ ಪರಿಶೀಲಕ',
    prescriptionScanner: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಸ್ಕ್ಯಾನರ್',
    myMedicines: 'ನನ್ನ ಔಷಧಿಗಳು',
    safetyGuidelines: 'ಸುರಕ್ಷತಾ ಮಾರ್ಗಸೂಚಿಗಳು',
    checkerTitle: 'ಔಷಧಿ ಮತ್ತು ಬ್ರಾಂಡ್ ಪರಿಶೀಲಕ',
    checkerSubtitle: 'ಯಾವುದೇ ಭಾರತೀಯ ಔಷಧಿ ಬ್ರಾಂಡ್ ಅಥವಾ ಜೆನೆರಿಕ್ ಹೆಸರನ್ನು ಹುಡುಕಿ ಅದರ ಉಪಯೋಗಗಳು ಮತ್ತು ಸಕ್ರಿಯ ಘಟಕಗಳನ್ನು ತಿಳಿಯಿರಿ.',
    searchLabel: 'ಔಷಧಿಯ ಬ್ರಾಂಡ್ ಅಥವಾ ಜೆನೆರಿಕ್ ಹೆಸರನ್ನು ಹುಡುಕಿ',
    searchPlaceholder: 'ಉದಾ: Dolo 650, Augmentin 625, Telma 40...',
    checkUsesBtn: 'ಉಪಯೋಗ ಪರಿಶೀಲಿಸಿ',
    searchingBtn: 'ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
    primaryUses: 'ಪ್ರಮುಖ ಉಪಯೋಗಗಳು ಮತ್ತು ವೈದ್ಯಕೀಯ ಮಾಹಿತಿ',
    activeIngredients: 'ಸಕ್ರಿಯ ರಾಸಾಯನಿಕ ಘಟಕಗಳು',
    genericComposition: 'ಜೆನೆರಿಕ್ ಸಂಯೋಜನೆ',
    historyTitle: 'ನನ್ನ ಔಷಧಿಗಳು ಮತ್ತು ಇತಿಹಾಸ',
    historySubtitle: 'ನೀವು ಹುಡುಕಿದ ಮತ್ತು ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಔಷಧಿಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ದಾಖಲಿಸುತ್ತದೆ.',
    addMedicineBtn: '+ ಔಷಧಿ ಸೇರಿಸಿ',
    clearAllBtn: 'ಎಲ್ಲಾ ಇತಿಹಾಸ ಅಳಿಸಿ',
    deleteBtn: 'ಅಳಿಸಿ',
    clinicalNoticeTitle: 'ವೈದ್ಯಕೀಯ ಸುರಕ್ಷತಾ ಸೂಚನೆ',
    clinicalNoticeBody: 'ಫಲಿತಾಂಶಗಳು ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ. ಯಾವಾಗಲೂ ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  },
  hi: {
    medicineChecker: 'दवा जांचक',
    prescriptionScanner: 'प्रिस्क्रिप्शन स्कैनर',
    myMedicines: 'मेरी दवाइयाँ',
    safetyGuidelines: 'सुरक्षा दिशानिर्देश',
    checkerTitle: 'दवा और ब्रांड जांचक',
    checkerSubtitle: 'किसी भी भारतीय दवा ब्रांड या जेनेरिक नाम को खोजें और उसके उपयोग व सक्रिय तत्वों की जानकारी देखें।',
    searchLabel: 'दवा का ब्रांड या जेनेरिक नाम खोजें',
    searchPlaceholder: 'उदाहरण: Dolo 650, Augmentin 625, Telma 40...',
    checkUsesBtn: 'उपयोग देखें',
    searchingBtn: 'खोजा जा रहा है...',
    primaryUses: 'मुख्य उपयोग और चिकित्सीय जानकारी',
    activeIngredients: 'सक्रिय रासायनिक तत्व',
    genericComposition: 'जेनेरिक संरचना',
    historyTitle: 'मेरी दवाइयाँ और इतिहास',
    historySubtitle: 'आपकी खोजी और स्कैन की गई दवाइयों का रिकॉर्ड रखता है और डुप्लिकेट साल्ट की जांच करता है।',
    addMedicineBtn: '+ दवा जोड़ें',
    clearAllBtn: 'पूरा इतिहास मिटाएं',
    deleteBtn: 'हटाएं',
    clinicalNoticeTitle: 'चिकित्सीय सुरक्षा सूचना',
    clinicalNoticeBody: 'यह जानकारी केवल संदर्भ के लिए है। हमेशा अपने डॉक्टर से परामर्श लें।',
  },
};

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<LanguageCode>('en');

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};