import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

export type AppLanguage = "en" | "hi" | "kn";

const TRANSLATIONS = {
  en: {
    // Sidebar & Workspace
    clinicalWorkspace: "Clinical Workspace",
    medicineChecker: "Medicine Checker",
    prescriptionScanner: "Prescription Scanner",
    myMedicines: "My Medicines",
    genericSaver: "Jan Aushadhi Saver",
    safetyGuidelines: "Safety Guidelines",
    clinicalNoticeTitle: "Clinical Safety Notice",
    clinicalNoticeBody:
      "MedSafe India screens active chemical salts deterministically. Always verify with a licensed doctor.",

    // Brand & Navbar
    appTitle: "MedSafe India",
    tagline: "Clinical Prescription Safety & Caregiver Assistant",
    navSubtitle: "Clinical Prescription & Generic Safety Suite",
    alertProfile: "Alert Profile",
    autoScreening: "Auto-Screening",
    roleClinician: "Clinician",
    rolePatient: "Patient / Caregiver",
    signOut: "Sign Out",

    // PrescriptionScannerPage
    scannerPageTitle: "Multi-Prescription Safety Checker",
    scannerPageSubtitle:
      "Upload your existing prescription first, then add new prescriptions to check cross-prescription interactions.",
    genericPricesBtn: "Generic Prices",
    clearAllBtn: "Clear All",
    step1Title: "Upload Rx",
    step1Desc: "Scan printed or handwritten Rx",
    step2Title: "Safety & Voice",
    step2Desc: "Interactions, pillbox & audio",
    step3Title: "Generic Saver",
    step3Desc: "Compare Jan Aushadhi MRP",
    uploadStep1Prompt: "Step 1: Upload Existing / Ongoing Prescription",
    uploadNextStepPrefix: "Step",
    uploadNextStepPrompt: "Upload New Prescription to Compare",
    combinedReportTitle: "Combined Patient Safety Report",
    prescriptionSingular: "Prescription",
    prescriptionPlural: "Prescriptions",
    crossCheckingLabel: "Cross-checking",
    uniqueActiveIngredientsLabel: "unique active ingredients across all active medications",
    checkingStatus: "Checking...",
    noInteractionsTitle: "No Interactions Detected",
    noInteractionsDesc:
      "Medications across your uploaded prescriptions do not show known conflicting interactions.",
    interactionsFoundPrefix: "Warning",
    interactionsFoundSuffix: "Drug-Drug Interaction(s) Found Across Prescriptions!",
    rxBaselineLabel: "Prescription #1 (Existing / Baseline Regimen)",
    rxConsultationLabel: "Prescription",
    scannedAtLabel: "Scanned at",
    removeBtn: "Remove",
    noMatchingMedsFound: "No matching database medicines found in this scan.",

    // Daily Visual Pill Organizer & Caregiver Summary
    pillOrganizerTitle: "Daily Visual Pill Organizer",
    morning: "Morning",
    afternoon: "Afternoon",
    night: "Night",
    beforeBreakfast: "Before Breakfast",
    beforeDinner: "Before Dinner",
    afterFood: "After Food",
    shareWhatsapp: "Share on WhatsApp",
    listenSummary: "Listen Summary",

    // Medicine Lookup & Jan Aushadhi
    searchPlaceholder: "Enter Indian brand name (e.g., Dolo 650, Pan-D, Ecosprin)...",
    primaryUses: "Primary Clinical Uses",
    precautions: "Key Precautions",
    genericSavings: "Jan Aushadhi Generic Savings",
    brandedPrice: "Branded MRP",
    janAushadhiPrice: "Jan Aushadhi Price",
    estimatedSavings: "Estimated Savings",
    disclaimer: "Clinical decision-support tool only. Always consult a licensed doctor.",
  },
  hi: {
    // Sidebar & Workspace
    clinicalWorkspace: "क्लिनिकल कार्यक्षेत्र",
    medicineChecker: "दवा और रिएक्शन जांचें",
    prescriptionScanner: "पर्चा स्कैनर (Rx)",
    myMedicines: "मेरी दवाइयां",
    genericSaver: "जन औषधि बचत",
    safetyGuidelines: "सुरक्षा दिशानिर्देश",
    clinicalNoticeTitle: "चिकित्सा सुरक्षा सूचना",
    clinicalNoticeBody:
      "मेडसेफ इंडिया दवाओं के सक्रिय रासायनिक तत्वों की जांच करता है। हमेशा डॉक्टर से परामर्श लें।",

    // Brand & Navbar
    appTitle: "मेडसेफ इंडिया (MedSafe India)",
    tagline: "प्रिस्क्रिप्शन सुरक्षा और देखभाल सहायक",
    navSubtitle: "क्लिनिकल प्रिस्क्रिप्शन और जेनेरिक सुरक्षा सूट",
    alertProfile: "स्वास्थ्य अलर्ट",
    autoScreening: "स्वचालित जांच",
    roleClinician: "डॉक्टर / चिकित्सक",
    rolePatient: "मरीज़ / देखभालकर्ता",
    signOut: "लॉग आउट",

    // PrescriptionScannerPage
    scannerPageTitle: "मल्टी-प्रिस्क्रिप्शन सुरक्षा जांचकर्ता",
    scannerPageSubtitle:
      "पहले अपना मौजूदा पर्चा अपलोड करें, फिर दवाओं के बीच आपसी रिएक्शन जांचने के लिए नए पर्चे जोड़ें।",
    genericPricesBtn: "जेनेरिक कीमतें",
    clearAllBtn: "सभी हटाएं",
    step1Title: "पर्चा अपलोड करें",
    step1Desc: "प्रिंटेड या हस्तलिखित पर्चा स्कैन करें",
    step2Title: "सुरक्षा और ऑडियो",
    step2Desc: "रिएक्शन, पिलबॉक्स और आवाज़",
    step3Title: "जेनेरिक बचत",
    step3Desc: "जन औषधि कीमत की तुलना करें",
    uploadStep1Prompt: "चरण 1: मौजूदा / चल रहा प्रिस्क्रिप्शन अपलोड करें",
    uploadNextStepPrefix: "चरण",
    uploadNextStepPrompt: "तुलना करने के लिए नया प्रिस्क्रिप्शन अपलोड करें",
    combinedReportTitle: "संयुक्त रोगी सुरक्षा रिपोर्ट",
    prescriptionSingular: "प्रिस्क्रिप्शन",
    prescriptionPlural: "प्रिस्क्रिप्शन",
    crossCheckingLabel: "क्रॉस-चेकिंग",
    uniqueActiveIngredientsLabel: "सभी दवाओं के सक्रिय रासायनिक तत्व (Salts)",
    checkingStatus: "जांच हो रही है...",
    noInteractionsTitle: "कोई रिएक्शन नहीं मिला",
    noInteractionsDesc:
      "आपके अपलोड किए गए पर्चों की दवाओं के बीच कोई ज्ञात हानिकारक रिएक्शन नहीं पाया गया है।",
    interactionsFoundPrefix: "चेतावनी",
    interactionsFoundSuffix: "दवाओं के बीच गंभीर रिएक्शन पाए गए हैं!",
    rxBaselineLabel: "प्रिस्क्रिप्शन #1 (मौजूदा दवाइयां)",
    rxConsultationLabel: "प्रिस्क्रिप्शन",
    scannedAtLabel: "स्कैन समय:",
    removeBtn: "हटाएं",
    noMatchingMedsFound: "इस स्कैन में कोई मिलती-जुलती दवा नहीं मिली।",

    // Daily Visual Pill Organizer & Caregiver Summary
    pillOrganizerTitle: "दैनिक दवा समय-सारणी (Pill Organizer)",
    morning: "सुबह",
    afternoon: "दोपहर",
    night: "रात",
    beforeBreakfast: "नाश्ते से पहले",
    beforeDinner: "रात के खाने से पहले",
    afterFood: "खाने के बाद",
    shareWhatsapp: "WhatsApp पर भेजें",
    listenSummary: "ऑडियो सुनें",

    // Medicine Lookup & Jan Aushadhi
    searchPlaceholder: "दवा का नाम लिखें (जैसे Dolo 650, Pan-D, Ecosprin)...",
    primaryUses: "मुख्य उपयोग और संकेत",
    precautions: "मुख्य सावधानियां",
    genericSavings: "जन औषधि जेनेरिक बचत",
    brandedPrice: "ब्रांडेड कीमत (MRP)",
    janAushadhiPrice: "जन औषधि कीमत",
    estimatedSavings: "अनुमानित बचत",
    disclaimer: "यह केवल जानकारी के लिए है। हमेशा डॉक्टर की सलाह लें।",
  },
  kn: {
    // Sidebar & Workspace
    clinicalWorkspace: "ವೈದ್ಯಕೀಯ ಕಾರ್ಯಕ್ಷೇತ್ರ",
    medicineChecker: "ಔಷಧ ಪರಿಶೀಲನೆ",
    prescriptionScanner: "ಚೀಟಿ ಸ್ಕ್ಯಾನರ್ (Rx)",
    myMedicines: "ನನ್ನ ಔಷಧಿಗಳು",
    genericSaver: "ಜನೌಷಧಿ ಉಳಿತಾಯ",
    safetyGuidelines: "ಸುರಕ್ಷತಾ ಮಾರ್ಗಸೂಚಿಗಳು",
    clinicalNoticeTitle: "ವೈದ್ಯಕೀಯ ಸುರಕ್ಷತಾ ಸೂಚನೆ",
    clinicalNoticeBody:
      "ಮೆಡ್‌ಸೇಫ್ ಇಂಡಿಯಾ ಔಷಧಿಗಳ ಸಕ್ರಿಯ ರಾಸಾಯನಿಕ ಅಂಶಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ. ಯಾವಾಗಲೂ ವೈದ್ಯರ ಸಲಹೆ ಪಡೆಯಿರಿ.",

    // Brand & Navbar
    appTitle: "ಮೆಡ್‌ಸೇಫ್ ಇಂಡಿಯಾ (MedSafe India)",
    tagline: "ಔಷಧ ಸುರಕ್ಷತೆ ಮತ್ತು ಆರೈಕೆ ಸಹಾಯಕ",
    navSubtitle: "ವೈದ್ಯಕೀಯ ಚೀಟಿ ಮತ್ತು ಜೆನೆರಿಕ್ ಸುರಕ್ಷತಾ ವ್ಯವಸ್ಥೆ",
    alertProfile: "ಆರೋಗ್ಯ ಎಚ್ಚರಿಕೆ",
    autoScreening: "ಸ್ವಯಂಚಾಲಿತ ಪರಿಶೀಲನೆ",
    roleClinician: "ವೈದ್ಯರು",
    rolePatient: "ರೋಗಿ / ಆರೈಕೆದಾರರು",
    signOut: "ಲಾಗ್ ಔಟ್",

    // PrescriptionScannerPage
    scannerPageTitle: "ಬಹು-ಚೀಟಿ ಸುರಕ್ಷತಾ ಪರಿಶೀಲಕ",
    scannerPageSubtitle:
      "ಮೊದಲು ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಚೀಟಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ನಂತರ ಅಡ್ಡಪರಿಣಾಮಗಳನ್ನು ಪರೀಕ್ಷಿಸಲು ಹೊಸ ಚೀಟಿಗಳನ್ನು ಸೇರಿಸಿ.",
    genericPricesBtn: "ಜೆನೆರಿಕ್ ಬೆಲೆಗಳು",
    clearAllBtn: "ಎಲ್ಲಾ ಅಳಿಸಿ",
    step1Title: "ಚೀಟಿ ಅಪ್‌ಲೋಡ್",
    step1Desc: "ಮುದ್ರಿತ ಅಥವಾ ಕೈಬರಹದ ಚೀಟಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    step2Title: "ಸುರಕ್ಷತೆ ಮತ್ತು ಧ್ವನಿ",
    step2Desc: "ಅಡ್ಡಪರಿಣಾಮ, ಪಿಲ್‌ಬಾಕ್ಸ್ ಮತ್ತು ಆಡಿಯೋ",
    step3Title: "ಜೆನೆರಿಕ್ ಉಳಿತಾಯ",
    step3Desc: "ಜನೌಷಧಿ ಬೆಲೆ ಹೋಲಿಸಿ",
    uploadStep1Prompt: "ಹಂತ 1: ಪ್ರಸ್ತುತ / ಚಾಲ್ತಿಯಲ್ಲಿರುವ ಚೀಟಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    uploadNextStepPrefix: "ಹಂತ",
    uploadNextStepPrompt: "ಹೋಲಿಸಲು ಹೊಸ ಚೀಟಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    combinedReportTitle: "ಸಂಯೋಜಿತ ರೋಗಿಯ ಸುರಕ್ಷತಾ ವರದಿ",
    prescriptionSingular: "ಚೀಟಿ",
    prescriptionPlural: "ಚೀಟಿಗಳು",
    crossCheckingLabel: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ",
    uniqueActiveIngredientsLabel: "ಸಕ್ರಿಯ ರಾಸಾಯನಿಕ ಅಂಶಗಳು (Salts)",
    checkingStatus: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    noInteractionsTitle: "ಯಾವುದೇ ಅಡ್ಡಪರಿಣಾಮ ಕಂಡುಬಂದಿಲ್ಲ",
    noInteractionsDesc:
      "ನಿಮ್ಮ ಚೀಟಿಗಳಲ್ಲಿರುವ ಔಷಧಿಗಳ ನಡುವೆ ಯಾವುದೇ ತಿಳಿದಿರುವ ಅಪಾಯಕಾರಿ ಅಡ್ಡಪರಿಣಾಮಗಳಿಲ್ಲ.",
    interactionsFoundPrefix: "ಎಚ್ಚರಿಕೆ",
    interactionsFoundSuffix: "ಔಷಧಿಗಳ ನಡುವೆ ಅಡ್ಡಪರಿಣಾಮ(ಗಳು) ಕಂಡುಬಂದಿವೆ!",
    rxBaselineLabel: "ಚೀಟಿ #1 (ಪ್ರಸ್ತುತ ಔಷಧಿಗಳು)",
    rxConsultationLabel: "ಚೀಟಿ",
    scannedAtLabel: "ಸ್ಕ್ಯಾನ್ ಸಮಯ:",
    removeBtn: "ತೆಗೆದುಹಾಕಿ",
    noMatchingMedsFound: "ಈ ಸ್ಕ್ಯಾನ್‌ನಲ್ಲಿ ಹೊಂದಾಣಿಕೆಯಾಗುವ ಔಷಧಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",

    // Daily Visual Pill Organizer & Caregiver Summary
    pillOrganizerTitle: "ದೈನಂದಿನ ಔಷಧ ವೇಳಾಪಟ್ಟಿ",
    morning: "ಬೆಳಿಗ್ಗೆ",
    afternoon: "ಮಧ್ಯಾಹ್ನ",
    night: "ರಾತ್ರಿ",
    beforeBreakfast: "ತಿಂಡಿಗೆ ಮುಂಚೆ",
    beforeDinner: "ರಾತ್ರಿ ಊಟಕ್ಕೆ ಮುಂಚೆ",
    afterFood: "ಊಟದ ನಂತರ",
    shareWhatsapp: "WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ",
    listenSummary: "ಧ್ವನಿ ವಿವರಣೆ ಕೇಳಿ",

    // Medicine Lookup & Jan Aushadhi
    searchPlaceholder: "ಔಷಧಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಉದಾ: Dolo 650, Pan-D)...",
    primaryUses: "ಮುಖ್ಯ ಉಪಯೋಗಗಳು",
    precautions: "ಮುಖ್ಯ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು",
    genericSavings: "ಜನೌಷಧಿ ಜೆನೆರಿಕ್ ಉಳಿತಾಯ",
    brandedPrice: "ಬ್ರಾಂಡೆಡ್ ಬೆಲೆ (MRP)",
    janAushadhiPrice: "ಜನೌಷಧಿ ಬೆಲೆ",
    estimatedSavings: "ಅಂದಾಜು ಉಳಿತಾಯ",
    disclaimer: "ಇದು ಮಾಹಿತಿಗಾಗಿ ಮಾತ್ರ. ಯಾವಾಗಲೂ ವೈದ್ಯರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
  },
} as const;

export type TranslationDict = typeof TRANSLATIONS["en"];
export type Translator = TranslationDict & ((key: string) => string);

interface LanguageContextValue {
  lang: AppLanguage;
  language: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  setLanguage: (lang: AppLanguage) => void;
  t: Translator;
}

const buildTranslator = (lang: AppLanguage): Translator => {
  const dict = TRANSLATIONS[lang];
  const fn = (key: string): string =>
    (dict as Record<string, string>)[key] ||
    (TRANSLATIONS.en as Record<string, string>)[key] ||
    key;
  return Object.assign(fn, dict) as Translator;
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  language: "en",
  setLang: () => {},
  setLanguage: () => {},
  t: buildTranslator("en"),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem("medsafe_lang");
    return saved === "hi" || saved === "kn" ? saved : "en";
  });

  const setLang = (newLang: AppLanguage) => {
    setLangState(newLang);
    localStorage.setItem("medsafe_lang", newLang);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => buildTranslator(lang), [lang]);

  return (
    <LanguageContext.Provider
      value={{ lang, language: lang, setLang, setLanguage: setLang, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);