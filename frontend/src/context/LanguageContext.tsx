import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

export type AppLanguage = "en" | "hi" | "kn";

const TRANSLATIONS = {
  en: {
    // LoginPage
    loginPlatformPill: "CLINICAL MEDICATION SAFETY PLATFORM • INDIA",
    loginHeroDesc:
      "AI-powered multi-prescription drug interaction screening, PMBJP Jan Aushadhi generic cost savings, and multilingual caregiver voice guidance.",
    loginFeature1Title: "Cross-Prescription Safety Engine",
    loginFeature1Desc:
      "Detects hidden drug–drug interactions, duplicate active salts, and condition contraindications across multiple doctors.",
    loginFeature2Title: "Jan Aushadhi Generic Cost Saver",
    loginFeature2Desc:
      "Matches expensive branded prescriptions to Indian Pharmacopoeia (IP) equivalents with up to 80% MRP savings.",
    loginFeature3Title: "Kannada, Hindi & English Caregiver Voice",
    loginFeature3Desc:
      "Translates complex pharmacology warnings into clear spoken summaries for elderly patients and families.",
    loginFooterLeft: "Aligned with Indian Pharmacopoeia (IP) & PMBJP Standards",
    loginFooterRight: "Built for Safer Prescriptions",
    loginMobileTagline: "Prescription Safety • Jan Aushadhi Savings • Voice Care",
    loginHeading: "Sign in to MedSafe",
    loginSubheading:
      "Personalize drug screening with your health profile or launch an instant demo.",
    loginJudgeAccessTitle: "Instant Evaluator / Judge Access",
    loginPatientDemoBtn: "Patient Demo",
    loginClinicianDemoBtn: "Clinician Demo",
    loginOrDivider: "or sign in with profile",
    loginRoleDoctorPharmacist: "Doctor / Pharmacist",
    loginUsernameLabel: "Username",
    loginUsernamePlaceholder: "Enter your username",
    loginEmailLabel: "Email Address",
    loginPasswordLabel: "Password",
    loginConditionsLabel: "Pre-Existing Conditions (Auto-screened on every scan)",
    loginSubmitBtn: "Continue to Clinical Workspace",
    condGastricUlcer: "Gastric Ulcer",
    condKidneyDisease: "Kidney Disease",
    condLiverDisease: "Liver Disease",
    condPregnancy: "Pregnancy / Breastfeeding",
    condAlcohol: "Alcohol",

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

    // MobileBottomNav
    mobileNavHome: "Home",
    mobileNavScanner: "Scanner",
    mobileNavChecker: "Checker",
    mobileNavSave: "Save 80%",
    mobileNavMyMeds: "My Meds",

    // LandingPage
    heroBadgeText: "Verified Indian Medicine Safety & Interaction Checker",
    heroTitlePrefix: "Safe Medication Choices for",
    heroTitleHighlight: "India",
    heroSubtitle:
      "Verify Indian medicine brands, resolve active salt compositions, detect duplicate ingredients, and check deterministic drug–drug interactions.",
    heroQuickJumpLabel: "Quick jump:",
    heroScanRxPill: "Scan Prescription",
    heroJanAushadhiPill: "Jan Aushadhi Savings",
    heroEngineSubtitle: "Deterministic CDSS Engine",
    heroSafetyMandateTitle: "Clinical Safety Mandate",
    heroSafetyMandateBody:
      "MedSafe India relies on structured verified pharmaceutical databases and deterministic rules. OCR results are treated as uncertain until confirmed by you before safety evaluation.",
    card1Title: "Brand & Salt Search",
    card1Desc:
      "Map Indian medicine brand names to their active generic ingredients, strengths, and manufacturers.",
    card1Action: "Search Medicines",
    card2Title: "Prescription OCR",
    card2Desc:
      "Upload handwritten or printed prescriptions for automated medicine extraction with user verification.",
    card2Action: "Open Scanner",
    card3Title: "Interaction & Pill Box",
    card3Desc:
      "Detect duplicate active salts across prescriptions and prevent harmful drug–drug interactions.",
    card3Action: "Check My Medicines",
    card4Title: "Jan Aushadhi Saver",
    card4Desc:
      "Compare expensive branded tablets with identical PMBJP generic salts to cut prescription costs up to 80%.",
    card4Action: "Compare Prices",

    // MedicineCheckerPage
    checkerPageTitle: "Medicine & Brand Checker",
    checkerPageSubtitle:
      "Search any Indian medicine brand or generic salt to view its therapeutic uses, active ingredients, and safety details.",
    checkerSearchLabel: "Search Medicine Brand or Generic Name",
    checkerSearchPlaceholder: "e.g., Dolo 650, Augmentin 625, Telma 40, Azithral 500...",
    checkerSearchingBtn: "Searching...",
    checkerCheckUsesBtn: "Check Uses",
    checkerTryLabel: "Try:",
    checkerEmptyState:
      "Enter a medicine brand name above to view its clinical uses and active composition.",
    checkerErrorFallback: "Could not retrieve medicine details.",
    checkerConnectionError: "Failed to connect to backend server.",
    genericCompositionLabel: "Generic Composition",
    primaryUsesHeading: "Primary Uses & Clinical Indications",
    activeChemicalIngredientsHeading: "Active Chemical Ingredients",

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

    // MyMedicinesPage
    myMedsPageTitle: "My Medicines & History",
    myMedsPageSubtitle:
      "Automatically tracks your searched and scanned medications, checks duplicate active salts, and lets you manage records.",
    myMedsClearAllBtn: "Clear All History",
    myMedsClearConfirm: "Clear all recorded medication history?",
    myMedsAddBtn: "+ Add Medicine",
    myMedsModalTitle: "Add Medicine to History",
    myMedsBrandPlaceholder: "Brand Name (e.g., Dolo 650)",
    myMedsSaltPlaceholder: "Active Salt(s) (e.g., Paracetamol)",
    myMedsStrengthPlaceholder: "Strength (e.g., 650mg)",
    myMedsNotesPlaceholder: "Reminder / Note (e.g., Daily at 9:00 AM)",
    myMedsCancelBtn: "Cancel",
    myMedsSaveBtn: "Save Record",
    myMedsDuplicateTitle: "Duplicate Active Ingredient Warning Detected",
    myMedsDuplicatePrefix: "You have multiple recorded medications containing",
    myMedsDuplicateSuffix:
      "Taking these together may exceed safe daily limits. Consult your physician.",
    myMedsLoading: "Loading medication history...",
    myMedsEmptyState:
      "No medication history recorded yet. Search a medicine in Medicine Checker, scan a prescription, or click + Add Medicine.",
    myMedsDuplicateBadge: "Duplicate Salt",
    myMedsRecordedBadge: "Recorded",
    myMedsDeleteBtn: "Delete",
    myMedsActiveSaltLabel: "Active Salt",
    myMedsNoteLabel: "Note",
    myMedsRecordedOnLabel: "Recorded on",

    // JanAushadhiSaver
    saverPageTitle: "Jan Aushadhi Generic Cost Saver",
    saverEngineBadge: "PMBJP Affordability Engine",
    saverPageSubtitle:
      "Compare branded prescription prices against equivalent Indian Pharmacopoeia (IP) generic medicines available at Jan Aushadhi Kendras.",
    saverInputPlaceholder: "e.g., Augmentin 625 Duo, Telma 40, Dolo 650",
    saverCalculatingBtn: "Calculating Savings...",
    saverCompareBtn: "Compare Generic Prices",
    saverEmptyInputError: "Please enter at least one medicine brand name.",
    saverRequestFailed: "Request failed with status",
    saverFetchError: "Failed to fetch Jan Aushadhi comparison.",
    saverSaveWord: "Save",
    saverOffWord: "off",
    saverBrandedEstLabel: "Branded Est.",
    saverJanAushadhiEstLabel: "Jan Aushadhi Est.",
    saverIpStandardNote:
      "Same active chemical salt & therapeutic strength under Indian Pharmacopoeia (IP) standards.",
    saverGenericIpSaltLabel: "Generic IP Salt",
    saverJanAushadhiShort: "Jan Aushadhi",
    saverYouSaveLabel: "You Save",

    // SafetyPage
    safetyPageTitle: "Clinical Safety & Guardrails",
    safetyPageSubtitle:
      "Understand how MedSafe India guarantees medical safety and strict data integrity.",
    safetyZeroLlmTitle: "Zero LLM Medical Decision Rule",
    safetyZeroLlmBody:
      "MedSafe India strictly prohibits Large Language Models from generating or deciding medicine facts, drug-drug interactions, or dosage instructions. LLMs are exclusively restricted to translating pre-verified structured facts into simpler language.",
    safetyVerifiedSourcesTitle: "Structured Verified Sources",
    safetyVerifiedSourcesBody:
      "All brand names, active salts, strengths, and manufacturers originate exclusively from verified Indian pharmaceutical datasets.",
    safetyOcrGuardrailsTitle: "Uncertain OCR Guardrails",
    safetyOcrGuardrailsBody:
      "Optical Character Recognition outputs are treated strictly as hypotheses until explicit user confirmation is provided.",

    // DailyPillOrganizer
    pillOrganizerTitle: "Visual Daily Pill Organizer",
    pillOrganizerSubtitle:
      "2x / 3x daily Morning, Afternoon & Night schedule — tap M / A / N or meal badges to adjust",
    pillShareScheduleBtn: "Share Schedule on WhatsApp",
    pillCustomizeTimingLabel: "Customize Timing (Morning • Afternoon • Night)",
    pillShortMorning: "M",
    pillShortAfternoon: "A",
    pillShortNight: "N",
    pillNoTabletsScheduled: "No tablets scheduled",
    pillSwitchMealTooltip: "Click to switch meal timing for this slot",
    pillNoneLabel: "None",
    pillWhatsappHeader: "MedSafe India — Daily Pill Schedule",
    pillWhatsappFooter: "Generated via MedSafe India Clinical Safety Assistant",
    morning: "Morning",
    afternoon: "Afternoon",
    night: "Night",
    beforeBreakfast: "Before Breakfast",
    afterBreakfast: "After Breakfast",
    beforeLunch: "Before Lunch",
    afterLunch: "After Lunch",
    beforeDinner: "Before Dinner",
    afterDinner: "After Dinner",
    afterFood: "After Food",
    shareWhatsapp: "Share on WhatsApp",
    listenSummary: "Listen Summary",

    // CaregiverAudioSummary
    audioSummaryTitle: "Caregiver Summary & Voice Readout",
    audioSummarySubtitle:
      "Listen in English, Kannada, or Hindi for elderly patients & family caregivers",
    audioTtsUnsupported: "Voice readout is not supported in this browser. Try Chrome or Edge.",
    audioStopBtn: "Stop",
    audioCopyTooltip: "Copy caregiver summary to share on WhatsApp",
    audioCopyBtn: "Copy",
    audioCopiedBtn: "Copied",

    // Shared Lookup & Pricing Fallbacks
    searchPlaceholder: "Enter Indian brand name (e.g., Dolo 650, Pan-D, Ecosprin)...",
    primaryUses: "Primary Clinical Uses",
    precautions: "Key Precautions",
    genericSavings: "Jan Aushadhi Generic Savings",
    brandedPrice: "Branded MRP",
    janAushadhiPrice: "Jan Aushadhi Price",
    estimatedSavings: "Estimated Prescription Savings",
    disclaimer: "Clinical decision-support tool only. Always consult a licensed doctor.",
  },
  hi: {
    // LoginPage
    loginPlatformPill: "क्लिनिकल दवा सुरक्षा प्लेटफ़ॉर्म • भारत",
    loginHeroDesc:
      "AI-आधारित मल्टी-प्रिस्क्रिप्शन ड्रग इंटरैक्शन जांच, PMBJP जन औषधि बचत और बहुभाषी देखभालकर्ता वॉयस मार्गदर्शन।",
    loginFeature1Title: "क्रॉस-प्रिस्क्रिप्शन सुरक्षा इंजन",
    loginFeature1Desc:
      "अलग-अलग डॉक्टरों के पर्चों में छिपे ड्रग इंटरैक्शन, डुप्लिकेट सक्रिय तत्व (Salts) और स्वास्थ्य जोखिमों को पहचानता है।",
    loginFeature2Title: "जन औषधि जेनेरिक बचत कैलकुलेटर",
    loginFeature2Desc:
      "महंगी ब्रांडेड दवाइयों की तुलना समान भारतीय फार्माकोपिया (IP) जेनेरिक विकल्पों से कर 80% तक बचत दिखाता है।",
    loginFeature3Title: "कन्नड़, हिंदी और अंग्रेज़ी वॉयस सहायक",
    loginFeature3Desc:
      "बुजुर्ग मरीज़ों और परिवार के सदस्यों के लिए जटिल दवा चेतावनियों को स्पष्ट बोलचाल की भाषा में समझाता है।",
    loginFooterLeft: "भारतीय फार्माकोपिया (IP) और PMBJP मानकों के अनुरूप",
    loginFooterRight: "सुरक्षित प्रिस्क्रिप्शन के लिए निर्मित",
    loginMobileTagline: "प्रिस्क्रिप्शन सुरक्षा • जन औषधि बचत • वॉयस केयर",
    loginHeading: "मेडसेफ में साइन इन करें",
    loginSubheading:
      "अपनी स्वास्थ्य प्रोफ़ाइल के साथ जांच व्यक्तिगत करें या तुरंत डेमो शुरू करें।",
    loginJudgeAccessTitle: "त्वरित परीक्षक / जज एक्सेस",
    loginPatientDemoBtn: "मरीज़ डेमो",
    loginClinicianDemoBtn: "डॉक्टर डेमो",
    loginOrDivider: "या प्रोफ़ाइल से साइन इन करें",
    loginRoleDoctorPharmacist: "डॉक्टर / फार्मासिस्ट",
    loginUsernameLabel: "उपयोगकर्ता नाम (Username)",
    loginUsernamePlaceholder: "अपना नाम दर्ज करें",
    loginEmailLabel: "ईमेल पता",
    loginPasswordLabel: "पासवर्ड",
    loginConditionsLabel: "पहले से मौजूद स्वास्थ्य स्थितियां (हर स्कैन पर स्वतः जांच)",
    loginSubmitBtn: "क्लिनिकल कार्यक्षेत्र में जाएं",
    condGastricUlcer: "पेट का अल्सर (Gastric Ulcer)",
    condKidneyDisease: "किडनी रोग",
    condLiverDisease: "लिवर रोग",
    condPregnancy: "गर्भावस्था / स्तनपान",
    condAlcohol: "शराब (Alcohol)",

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

    // MobileBottomNav
    mobileNavHome: "होम",
    mobileNavScanner: "स्कैनर",
    mobileNavChecker: "जांचें",
    mobileNavSave: "80% बचत",
    mobileNavMyMeds: "मेरी दवा",

    // LandingPage
    heroBadgeText: "सत्यापित भारतीय दवा सुरक्षा और इंटरैक्शन चेकर",
    heroTitlePrefix: "सुरक्षित दवा विकल्प —",
    heroTitleHighlight: "भारत के लिए",
    heroSubtitle:
      "भारतीय दवा ब्रांडों की जांच करें, सक्रिय रासायनिक तत्व (Salts) जानें, डुप्लिकेट दवाइयों को पहचानें और दवाओं के आपसी रिएक्शन रोकें।",
    heroQuickJumpLabel: "त्वरित विकल्प:",
    heroScanRxPill: "पर्चा स्कैन करें",
    heroJanAushadhiPill: "जन औषधि बचत",
    heroEngineSubtitle: "डिटरमिनिस्टिक CDSS इंजन",
    heroSafetyMandateTitle: "चिकित्सा सुरक्षा नियम",
    heroSafetyMandateBody:
      "मेडसेफ इंडिया सत्यापित फार्मास्युटिकल डेटाबेस और निर्धारित सुरक्षा नियमों पर काम करता है। सुरक्षा जांच से पहले OCR परिणामों की पुष्टि आवश्यक है।",
    card1Title: "ब्रांड और सॉल्ट खोजें",
    card1Desc:
      "भारतीय दवा ब्रांडों को उनके सक्रिय जेनेरिक तत्वों (Salts), ताकत और निर्माताओं से मिलाएं।",
    card1Action: "दवाइयां खोजें",
    card2Title: "प्रिस्क्रिप्शन OCR स्कैनर",
    card2Desc:
      "हस्तलिखित या प्रिंटेड पर्चे अपलोड करें और दवाइयों की स्वचालित पहचान करें।",
    card2Action: "स्कैनर खोलें",
    card3Title: "इंटरैक्शन और पिल बॉक्स",
    card3Desc:
      "अलग-अलग पर्चों में डुप्लिकेट सॉल्ट की पहचान करें और हानिकारक रिएक्शन रोकें।",
    card3Action: "मेरी दवाइयां देखें",
    card4Title: "जन औषधि बचत",
    card4Desc:
      "महंगी ब्रांडेड दवाइयों की तुलना समान PMBJP जेनेरिक सॉल्ट से करें और 80% तक खर्च बचाएं।",
    card4Action: "कीमतें तुलना करें",

    // MedicineCheckerPage
    checkerPageTitle: "दवा और ब्रांड चेकर",
    checkerPageSubtitle:
      "किसी भी भारतीय दवा ब्रांड या जेनेरिक सॉल्ट के मुख्य उपयोग, सक्रिय रासायनिक तत्व और सुरक्षा विवरण देखने के लिए खोजें।",
    checkerSearchLabel: "दवा का ब्रांड या जेनेरिक नाम खोजें",
    checkerSearchPlaceholder: "जैसे Dolo 650, Augmentin 625, Telma 40, Azithral 500...",
    checkerSearchingBtn: "खोज रहा है...",
    checkerCheckUsesBtn: "उपयोग जांचें",
    checkerTryLabel: "उदाहरण:",
    checkerEmptyState:
      "इसके क्लिनिकल उपयोग और सक्रिय तत्व देखने के लिए ऊपर दवा का नाम दर्ज करें।",
    checkerErrorFallback: "दवा का विवरण प्राप्त नहीं हो सका।",
    checkerConnectionError: "बैकएंड सर्वर से कनेक्ट नहीं हो सका।",
    genericCompositionLabel: "जेनेरिक संरचना (Generic Composition)",
    primaryUsesHeading: "मुख्य उपयोग और क्लिनिकल संकेत",
    activeChemicalIngredientsHeading: "सक्रिय रासायनिक तत्व (Active Ingredients)",

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

    // MyMedicinesPage
    myMedsPageTitle: "मेरी दवाइयां और इतिहास",
    myMedsPageSubtitle:
      "आपकी खोजी गई और स्कैन की गई दवाइयों को स्वचालित रूप से ट्रैक करता है, डुप्लिकेट सक्रिय तत्वों (Salts) की जांच करता है और रिकॉर्ड प्रबंधित करता है।",
    myMedsClearAllBtn: "सारा इतिहास साफ़ करें",
    myMedsClearConfirm: "क्या आप दर्ज की गई सभी दवाइयों का इतिहास हटाना चाहते हैं?",
    myMedsAddBtn: "+ दवा जोड़ें",
    myMedsModalTitle: "इतिहास में दवा जोड़ें",
    myMedsBrandPlaceholder: "ब्रांड का नाम (जैसे Dolo 650)",
    myMedsSaltPlaceholder: "सक्रिय तत्व / Salt (जैसे Paracetamol)",
    myMedsStrengthPlaceholder: "ताकत / Strength (जैसे 650mg)",
    myMedsNotesPlaceholder: "रिमाइंडर / नोट (जैसे रोज़ सुबह 9:00 बजे)",
    myMedsCancelBtn: "रद्द करें",
    myMedsSaveBtn: "रिकॉर्ड सहेजें",
    myMedsDuplicateTitle: "डुप्लिकेट सक्रिय तत्व (Salt) की चेतावनी",
    myMedsDuplicatePrefix: "आपकी सूची में एक से अधिक दवाइयों में यह सक्रिय तत्व मौजूद है:",
    myMedsDuplicateSuffix:
      "इन्हें एक साथ लेने से सुरक्षित दैनिक सीमा पार हो सकती है। अपने डॉक्टर से परामर्श लें।",
    myMedsLoading: "दवाइयों का इतिहास लोड हो रहा है...",
    myMedsEmptyState:
      "अभी तक कोई दवा दर्ज नहीं है। दवा चेकर में कोई दवा खोजें, पर्चा स्कैन करें, या + दवा जोड़ें पर क्लिक करें।",
    myMedsDuplicateBadge: "डुप्लिकेट Salt",
    myMedsRecordedBadge: "दर्ज किया गया",
    myMedsDeleteBtn: "हटाएं",
    myMedsActiveSaltLabel: "सक्रिय तत्व (Salt)",
    myMedsNoteLabel: "नोट",
    myMedsRecordedOnLabel: "दर्ज करने का समय:",

    // JanAushadhiSaver
    saverPageTitle: "जन औषधि जेनेरिक बचत कैलकुलेटर",
    saverEngineBadge: "PMBJP किफायती दवा इंजन",
    saverPageSubtitle:
      "ब्रांडेड दवाइयों की कीमतों की तुलना जन औषधि केंद्रों पर उपलब्ध समान भारतीय फार्माकोपिया (IP) जेनेरिक दवाइयों से करें।",
    saverInputPlaceholder: "जैसे Augmentin 625 Duo, Telma 40, Dolo 650",
    saverCalculatingBtn: "बचत की गणना हो रही है...",
    saverCompareBtn: "जेनेरिक कीमतें तुलना करें",
    saverEmptyInputError: "कृपया कम से कम एक दवा का ब्रांड नाम दर्ज करें।",
    saverRequestFailed: "अनुरोध विफल रहा, स्थिति:",
    saverFetchError: "जन औषधि तुलना प्राप्त करने में विफल।",
    saverSaveWord: "बचत",
    saverOffWord: "कम",
    saverBrandedEstLabel: "ब्रांडेड अनुमानित",
    saverJanAushadhiEstLabel: "जन औषधि अनुमानित",
    saverIpStandardNote:
      "भारतीय फार्माकोपिया (IP) मानकों के तहत समान सक्रिय रासायनिक तत्व और चिकित्सीय शक्ति।",
    saverGenericIpSaltLabel: "जेनेरिक IP सॉल्ट",
    saverJanAushadhiShort: "जन औषधि",
    saverYouSaveLabel: "आपकी बचत",

    // SafetyPage
    safetyPageTitle: "क्लिनिकल सुरक्षा और नियम (Guardrails)",
    safetyPageSubtitle:
      "जानें कि मेडसेफ इंडिया चिकित्सा सुरक्षा और डेटा की सटीकता कैसे सुनिश्चित करता है।",
    safetyZeroLlmTitle: "शून्य LLM चिकित्सा निर्णय नियम",
    safetyZeroLlmBody:
      "मेडसेफ इंडिया लार्ज लैंग्वेज मॉडल (LLM) को दवा के तथ्य, ड्रग इंटरैक्शन या खुराक तय करने से सख्ती से रोकता है। AI का उपयोग केवल सत्यापित तथ्यों को सरल भाषा में समझाने के लिए किया जाता है।",
    safetyVerifiedSourcesTitle: "सत्यापित डेटा स्रोत",
    safetyVerifiedSourcesBody:
      "सभी ब्रांड नाम, सक्रिय तत्व (Salts), ताकत और निर्माताओं की जानकारी विशेष रूप से सत्यापित भारतीय फार्मास्युटिकल डेटासेट से ली जाती है।",
    safetyOcrGuardrailsTitle: "OCR सुरक्षा सत्यापन",
    safetyOcrGuardrailsBody:
      "पर्चे की स्कैन (OCR) जानकारी को उपयोगकर्ता की स्पष्ट पुष्टि मिलने तक केवल अनुमान माना जाता है।",

    // DailyPillOrganizer
    pillOrganizerTitle: "दैनिक दवा समय-सारणी (Pill Organizer)",
    pillOrganizerSubtitle:
      "सुबह, दोपहर और रात की खुराक सूची — बदलने के लिए M / A / N या भोजन टैग पर टैप करें",
    pillShareScheduleBtn: "WhatsApp पर समय-सारणी भेजें",
    pillCustomizeTimingLabel: "समय अनुकूलित करें (सुबह • दोपहर • रात)",
    pillShortMorning: "सु",
    pillShortAfternoon: "दो",
    pillShortNight: "रा",
    pillNoTabletsScheduled: "कोई दवा निर्धारित नहीं",
    pillSwitchMealTooltip: "भोजन का समय बदलने के लिए क्लिक करें",
    pillNoneLabel: "कोई नहीं",
    pillWhatsappHeader: "मेडसेफ इंडिया — दैनिक दवा समय-सारणी",
    pillWhatsappFooter: "मेडसेफ इंडिया क्लिनिकल सुरक्षा सहायक द्वारा तैयार",
    morning: "सुबह",
    afternoon: "दोपहर",
    night: "रात",
    beforeBreakfast: "नाश्ते से पहले",
    afterBreakfast: "नाश्ते के बाद",
    beforeLunch: "दोपहर के खाने से पहले",
    afterLunch: "दोपहर के खाने के बाद",
    beforeDinner: "रात के खाने से पहले",
    afterDinner: "रात के खाने के बाद",
    afterFood: "खाने के बाद",
    shareWhatsapp: "WhatsApp पर भेजें",
    listenSummary: "ऑडियो सुनें",

    // CaregiverAudioSummary
    audioSummaryTitle: "देखभालकर्ता सारांश और वॉयस रीडआउट",
    audioSummarySubtitle:
      "बुजुर्ग मरीज़ों और परिवार के सदस्यों के लिए अंग्रेज़ी, कन्नड़ या हिंदी में सुनें",
    audioTtsUnsupported: "इस ब्राउज़र में वॉयस रीडआउट समर्थित नहीं है। Chrome या Edge का उपयोग करें।",
    audioStopBtn: "रोकें",
    audioCopyTooltip: "WhatsApp पर साझा करने के लिए सारांश कॉपी करें",
    audioCopyBtn: "कॉपी करें",
    audioCopiedBtn: "कॉपी हो गया",

    // Shared Lookup & Pricing Fallbacks
    searchPlaceholder: "दवा का नाम लिखें (जैसे Dolo 650, Pan-D, Ecosprin)...",
    primaryUses: "मुख्य उपयोग और संकेत",
    precautions: "मुख्य सावधानियां",
    genericSavings: "जन औषधि जेनेरिक बचत",
    brandedPrice: "ब्रांडेड कीमत (MRP)",
    janAushadhiPrice: "जन औषधि कीमत",
    estimatedSavings: "अनुमानित प्रिस्क्रिप्शन बचत",
    disclaimer: "यह केवल जानकारी के लिए है। हमेशा डॉक्टर की सलाह लें।",
  },
  kn: {
    // LoginPage
    loginPlatformPill: "ಕ್ಲಿನಿಕಲ್ ಔಷಧ ಸುರಕ್ಷತಾ ವೇದಿಕೆ • ಭಾರತ",
    loginHeroDesc:
      "AI-ಆಧಾರಿತ ಬಹು-ಚೀಟಿ ಔಷಧ ಅಡ್ಡಪರಿಣಾಮ ಪರಿಶೀಲನೆ, PMBJP ಜನೌಷಧಿ ವೆಚ್ಚ ಉಳಿತಾಯ ಮತ್ತು ಬಹುಭಾಷಾ ಆರೈಕೆದಾರರ ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ.",
    loginFeature1Title: "ಕ್ರಾಸ್-ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಸುರಕ್ಷತಾ ಎಂಜಿನ್",
    loginFeature1Desc:
      "ವಿವಿಧ ವೈದ್ಯರ ಚೀಟಿಗಳಲ್ಲಿ ಅಡಗಿರುವ ಔಷಧ ಅಡ್ಡಪರಿಣಾಮಗಳು, ಒಂದೇ ರೀತಿಯ ಸಕ್ರಿಯ ಅಂಶಗಳು (Salts) ಮತ್ತು ಆರೋಗ್ಯ ಅಪಾಯಗಳನ್ನು ಪತ್ತೆಹಚ್ಚುತ್ತದೆ.",
    loginFeature2Title: "ಜನೌಷಧಿ ಜೆನೆರಿಕ್ ವೆಚ್ಚ ಉಳಿತಾಯ",
    loginFeature2Desc:
      "ದುಬಾರಿ ಬ್ರಾಂಡೆಡ್ ಔಷಧಿಗಳನ್ನು ಭಾರತೀಯ ಫಾರ್ಮಾಕೋಪಿಯಾ (IP) ಸಮಾನ ಜೆನೆರಿಕ್ ಔಷಧಿಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ 80% ವರೆಗೆ ಉಳಿತಾಯ ತೋರಿಸುತ್ತದೆ.",
    loginFeature3Title: "ಕನ್ನಡ, ಹಿಂದಿ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಧ್ವನಿ ಸಹಾಯಕ",
    loginFeature3Desc:
      "ಹಿರಿಯ ರೋಗಿಗಳು ಮತ್ತು ಕುಟುಂಬದವರಿಗಾಗಿ ಸಂಕೀರ್ಣ ಔಷಧ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಸರಳ ಆಡುಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸುತ್ತದೆ.",
    loginFooterLeft: "ಭಾರತೀಯ ಫಾರ್ಮಾಕೋಪಿಯಾ (IP) ಮತ್ತು PMBJP ಮಾನದಂಡಗಳಿಗೆ ಅನುಗುಣವಾಗಿದೆ",
    loginFooterRight: "ಸುರಕ್ಷಿತ ಔಷಧ ಚೀಟಿಗಳಿಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ",
    loginMobileTagline: "ಔಷಧ ಸುರಕ್ಷತೆ • ಜನೌಷಧಿ ಉಳಿತಾಯ • ಧ್ವನಿ ಆರೈಕೆ",
    loginHeading: "ಮೆಡ್‌ಸೇಫ್‌ಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    loginSubheading:
      "ನಿಮ್ಮ ಆರೋಗ್ಯ ಪ್ರೊಫೈಲ್‌ನೊಂದಿಗೆ ಪರಿಶೀಲನೆಯನ್ನು ವೈಯಕ್ತೀಕರಿಸಿ ಅಥವಾ ತಕ್ಷಣ ಡೆಮೊ ಪ್ರಾರಂಭಿಸಿ.",
    loginJudgeAccessTitle: "ತ್ವರಿತ ಮೌಲ್ಯಮಾಪಕ / ಜಡ್ಜ್ ಪ್ರವೇಶ",
    loginPatientDemoBtn: "ರೋಗಿ ಡೆಮೊ",
    loginClinicianDemoBtn: "ವೈದ್ಯರ ಡೆಮೊ",
    loginOrDivider: "ಅಥವಾ ಪ್ರೊಫೈಲ್‌ನೊಂದಿಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    loginRoleDoctorPharmacist: "ವೈದ್ಯರು / ಫಾರ್ಮಸಿಸ್ಟ್",
    loginUsernameLabel: "ಬಳಕೆದಾರರ ಹೆಸರು (Username)",
    loginUsernamePlaceholder: "ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
    loginEmailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
    loginPasswordLabel: "ಪಾಸ್‌ವರ್ಡ್",
    loginConditionsLabel: "ಮೊದಲೇ ಇರುವ ಆರೋಗ್ಯ ಸ್ಥಿತಿಗಳು (ಪ್ರತಿ ಸ್ಕ್ಯಾನ್‌ನಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತ ಪರಿಶೀಲನೆ)",
    loginSubmitBtn: "ವೈದ್ಯಕೀಯ ಕಾರ್ಯಕ್ಷೇತ್ರಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ",
    condGastricUlcer: "ಹೊಟ್ಟೆಯ ಹುಣ್ಣು (Gastric Ulcer)",
    condKidneyDisease: "ಮೂತ್ರಪಿಂಡದ ಕಾಯಿಲೆ",
    condLiverDisease: "ಯಕೃತ್ತಿನ ಕಾಯಿಲೆ (Liver)",
    condPregnancy: "ಗರ್ಭಾವಸ್ಥೆ / ಹಾಲುಣಿಸುವಿಕೆ",
    condAlcohol: "ಮದ್ಯಪಾನ (Alcohol)",

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

    // MobileBottomNav
    mobileNavHome: "ಮುಖಪುಟ",
    mobileNavScanner: "ಸ್ಕ್ಯಾನರ್",
    mobileNavChecker: "ಪರಿಶೀಲಿಸಿ",
    mobileNavSave: "80% ಉಳಿಸಿ",
    mobileNavMyMeds: "ನನ್ನ ಔಷಧ",

    // LandingPage
    heroBadgeText: "ಪರಿಶೀಲಿಸಿದ ಭಾರತೀಯ ಔಷಧ ಸುರಕ್ಷತೆ ಮತ್ತು ಅಡ್ಡಪರಿಣಾಮ ಪರಿಶೀಲಕ",
    heroTitlePrefix: "ಸುರಕ್ಷಿತ ಔಷಧ ಆಯ್ಕೆಗಳು —",
    heroTitleHighlight: "ಭಾರತಕ್ಕಾಗಿ",
    heroSubtitle:
      "ಭಾರತೀಯ ಔಷಧ ಬ್ರಾಂಡ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಸಕ್ರಿಯ ರಾಸಾಯನಿಕ ಅಂಶಗಳನ್ನು (Salts) ತಿಳಿಯಿರಿ, ಒಂದೇ ರೀತಿಯ ಔಷಧಿಗಳನ್ನು ಗುರುತಿಸಿ ಮತ್ತು ಅಡ್ಡಪರಿಣಾಮಗಳನ್ನು ತಡೆಯಿರಿ.",
    heroQuickJumpLabel: "ತ್ವರಿತ ಆಯ್ಕೆ:",
    heroScanRxPill: "ಚೀಟಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    heroJanAushadhiPill: "ಜನೌಷಧಿ ಉಳಿತಾಯ",
    heroEngineSubtitle: "ಡಿಟರ್ಮಿನಿಸ್ಟಿಕ್ CDSS ಎಂಜಿನ್",
    heroSafetyMandateTitle: "ವೈದ್ಯಕೀಯ ಸುರಕ್ಷತಾ ನಿಯಮ",
    heroSafetyMandateBody:
      "ಮೆಡ್‌ಸೇಫ್ ಇಂಡಿಯಾ ಪರಿಶೀಲಿಸಿದ ಔಷಧ ಡೇಟಾಬೇಸ್ ಮತ್ತು ನಿರ್ದಿಷ್ಟ ಸುರಕ್ಷತಾ ನಿಯಮಗಳನ್ನು ಅವಲಂಬಿಸಿದೆ. ಸುರಕ್ಷತಾ ಮೌಲ್ಯಮಾಪನದ ಮೊದಲು OCR ಫಲಿತಾಂಶಗಳನ್ನು ನೀವು ದೃಢೀಕರಿಸಬೇಕು.",
    card1Title: "ಬ್ರಾಂಡ್ ಮತ್ತು ಸಾಲ್ಟ್ ಹುಡುಕಾಟ",
    card1Desc:
      "ಭಾರತೀಯ ಔಷಧ ಬ್ರಾಂಡ್‌ಗಳನ್ನು ಅವುಗಳ ಸಕ್ರಿಯ ಜೆನೆರಿಕ್ ಅಂಶಗಳು (Salts), ಪ್ರಮಾಣ ಮತ್ತು ತಯಾರಕರೊಂದಿಗೆ ಹೊಂದಿಸಿ.",
    card1Action: "ಔಷಧಿಗಳನ್ನು ಹುಡುಕಿ",
    card2Title: "ಚೀಟಿ OCR ಸ್ಕ್ಯಾನರ್",
    card2Desc:
      "ಕೈಬರಹದ ಅಥವಾ ಮುದ್ರಿತ ಚೀಟಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಔಷಧಿಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಗುರುತಿಸಿ.",
    card2Action: "ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಿರಿ",
    card3Title: "ಅಡ್ಡಪರಿಣಾಮ ಮತ್ತು ಪಿಲ್ ಬಾಕ್ಸ್",
    card3Desc:
      "ವಿವಿಧ ಚೀಟಿಗಳಲ್ಲಿ ಒಂದೇ ರೀತಿಯ ಸಕ್ರಿಯ ಅಂಶಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ ಮತ್ತು ಅಪಾಯಕಾರಿ ಅಡ್ಡಪರಿಣಾಮಗಳನ್ನು ತಡೆಯಿರಿ.",
    card3Action: "ನನ್ನ ಔಷಧಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
    card4Title: "ಜನೌಷಧಿ ಉಳಿತಾಯ",
    card4Desc:
      "ದುಬಾರಿ ಬ್ರಾಂಡೆಡ್ ಮಾತ್ರೆಗಳನ್ನು ಸಮಾನ PMBJP ಜೆನೆರಿಕ್ ಸಾಲ್ಟ್‌ಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ 80% ವರೆಗೆ ವೆಚ್ಚ ಉಳಿಸಿ.",
    card4Action: "ಬೆಲೆಗಳನ್ನು ಹೋಲಿಸಿ",

    // MedicineCheckerPage
    checkerPageTitle: "ಔಷಧ ಮತ್ತು ಬ್ರಾಂಡ್ ಪರಿಶೀಲಕ",
    checkerPageSubtitle:
      "ಯಾವುದೇ ಭಾರತೀಯ ಔಷಧ ಬ್ರಾಂಡ್ ಅಥವಾ ಜೆನೆರಿಕ್ ಸಾಲ್ಟ್‌ನ ಮುಖ್ಯ ಉಪಯೋಗಗಳು, ಸಕ್ರಿಯ ಅಂಶಗಳು ಮತ್ತು ಸುರಕ್ಷತಾ ವಿವರಗಳನ್ನು ನೋಡಲು ಹುಡುಕಿ.",
    checkerSearchLabel: "ಔಷಧ ಬ್ರಾಂಡ್ ಅಥವಾ ಜೆನೆರಿಕ್ ಹೆಸರನ್ನು ಹುಡುಕಿ",
    checkerSearchPlaceholder: "ಉದಾ: Dolo 650, Augmentin 625, Telma 40, Azithral 500...",
    checkerSearchingBtn: "ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
    checkerCheckUsesBtn: "ಉಪಯೋಗ ಪರಿಶೀಲಿಸಿ",
    checkerTryLabel: "ಪ್ರಯತ್ನಿಸಿ:",
    checkerEmptyState:
      "ಔಷಧದ ಕ್ಲಿನಿಕಲ್ ಉಪಯೋಗಗಳು ಮತ್ತು ಸಕ್ರಿಯ ಅಂಶಗಳನ್ನು ನೋಡಲು ಮೇಲೆ ಬ್ರಾಂಡ್ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
    checkerErrorFallback: "ಔಷಧದ ವಿವರಗಳನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    checkerConnectionError: "ಬ್ಯಾಕೆಂಡ್ ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    genericCompositionLabel: "ಜೆನೆರಿಕ್ ಸಂಯೋಜನೆ (Generic Composition)",
    primaryUsesHeading: "ಮುಖ್ಯ ಉಪಯೋಗಗಳು ಮತ್ತು ಕ್ಲಿನಿಕಲ್ ಸೂಚನೆಗಳು",
    activeChemicalIngredientsHeading: "ಸಕ್ರಿಯ ರಾಸಾಯನಿಕ ಅಂಶಗಳು (Active Ingredients)",

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

    // MyMedicinesPage
    myMedsPageTitle: "ನನ್ನ ಔಷಧಿಗಳು ಮತ್ತು ಇತಿಹಾಸ",
    myMedsPageSubtitle:
      "ನಿಮ್ಮ ಹುಡುಕಿದ ಮತ್ತು ಸ್ಕ್ಯಾನ್ ಮಾಡಿದ ಔಷಧಿಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ದಾಖಲಿಸುತ್ತದೆ, ಒಂದೇ ರೀತಿಯ ಸಕ್ರಿಯ ಅಂಶಗಳನ್ನು (Salts) ಪರಿಶೀಲಿಸುತ್ತದೆ.",
    myMedsClearAllBtn: "ಎಲ್ಲಾ ಇತಿಹಾಸ ಅಳಿಸಿ",
    myMedsClearConfirm: "ದಾಖಲಾದ ಎಲ್ಲಾ ಔಷಧಿಗಳ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಬೇಕೆ?",
    myMedsAddBtn: "+ ಔಷಧ ಸೇರಿಸಿ",
    myMedsModalTitle: "ಇತಿಹಾಸಕ್ಕೆ ಔಷಧ ಸೇರಿಸಿ",
    myMedsBrandPlaceholder: "ಬ್ರಾಂಡ್ ಹೆಸರು (ಉದಾ: Dolo 650)",
    myMedsSaltPlaceholder: "ಸಕ್ರಿಯ ಅಂಶ / Salt (ಉದಾ: Paracetamol)",
    myMedsStrengthPlaceholder: "ಪ್ರಮಾಣ / Strength (ಉದಾ: 650mg)",
    myMedsNotesPlaceholder: "ಜ್ಞಾಪನೆ / ಟಿಪ್ಪಣಿ (ಉದಾ: ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ 9:00 ಗಂಟೆಗೆ)",
    myMedsCancelBtn: "ರದ್ದುಮಾಡಿ",
    myMedsSaveBtn: "ದಾಖಲೆ ಉಳಿಸಿ",
    myMedsDuplicateTitle: "ಒಂದೇ ರೀತಿಯ ಸಕ್ರಿಯ ಅಂಶ (Duplicate Salt) ಎಚ್ಚರಿಕೆ",
    myMedsDuplicatePrefix: "ನಿಮ್ಮ ಪಟ್ಟಿಯಲ್ಲಿರುವ ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು ಔಷಧಿಗಳಲ್ಲಿ ಈ ಸಕ್ರಿಯ ಅಂಶವಿದೆ:",
    myMedsDuplicateSuffix:
      "ಇವುಗಳನ್ನು ಒಟ್ಟಿಗೆ ತೆಗೆದುಕೊಳ್ಳುವುದರಿಂದ ಸುರಕ್ಷಿತ ದೈನಂದಿನ ಮಿತಿ ಮೀರಬಹುದು. ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
    myMedsLoading: "ಔಷಧಿಗಳ ಇತಿಹಾಸ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    myMedsEmptyState:
      "ಇನ್ನೂ ಯಾವುದೇ ಔಷಧಿ ಇತಿಹಾಸ ದಾಖಲಾಗಿಲ್ಲ. ಔಷಧ ಪರಿಶೀಲಕದಲ್ಲಿ ಹುಡುಕಿ, ಚೀಟಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ, ಅಥವಾ + ಔಷಧ ಸೇರಿಸಿ ಕ್ಲಿಕ್ ಮಾಡಿ.",
    myMedsDuplicateBadge: "ಡುಪ್ಲಿಕೇಟ್ Salt",
    myMedsRecordedBadge: "ದಾಖಲಾಗಿದೆ",
    myMedsDeleteBtn: "ಅಳಿಸಿ",
    myMedsActiveSaltLabel: "ಸಕ್ರಿಯ ಅಂಶ (Salt)",
    myMedsNoteLabel: "ಟಿಪ್ಪಣಿ",
    myMedsRecordedOnLabel: "ದಾಖಲಾದ ಸಮಯ:",

    // JanAushadhiSaver
    saverPageTitle: "ಜನೌಷಧಿ ಜೆನೆರಿಕ್ ವೆಚ್ಚ ಉಳಿತಾಯ",
    saverEngineBadge: "PMBJP ಕೈಗೆಟುಕುವ ದರ ಎಂಜಿನ್",
    saverPageSubtitle:
      "ಬ್ರಾಂಡೆಡ್ ಔಷಧಿಗಳ ಬೆಲೆಗಳನ್ನು ಜನೌಷಧಿ ಕೇಂದ್ರಗಳಲ್ಲಿ ಲಭ್ಯವಿರುವ ಸಮಾನ ಭಾರತೀಯ ಫಾರ್ಮಾಕೋಪಿಯಾ (IP) ಜೆನೆರಿಕ್ ಔಷಧಿಗಳೊಂದಿಗೆ ಹೋಲಿಸಿ.",
    saverInputPlaceholder: "ಉದಾ: Augmentin 625 Duo, Telma 40, Dolo 650",
    saverCalculatingBtn: "ಉಳಿತಾಯವನ್ನು ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ...",
    saverCompareBtn: "ಜೆನೆರಿಕ್ ಬೆಲೆಗಳನ್ನು ಹೋಲಿಸಿ",
    saverEmptyInputError: "ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಔಷಧ ಬ್ರಾಂಡ್ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
    saverRequestFailed: "ವಿನಂತಿ ವಿಫಲವಾಗಿದೆ, ಸ್ಥಿತಿ:",
    saverFetchError: "ಜನೌಷಧಿ ಹೋಲಿಕೆಯನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    saverSaveWord: "ಉಳಿತಾಯ",
    saverOffWord: "ಕಡಿಮೆ",
    saverBrandedEstLabel: "ಬ್ರಾಂಡೆಡ್ ಅಂದಾಜು",
    saverJanAushadhiEstLabel: "ಜನೌಷಧಿ ಅಂದಾಜು",
    saverIpStandardNote:
      "ಭಾರತೀಯ ಫಾರ್ಮಾಕೋಪಿಯಾ (IP) ಮಾನದಂಡಗಳ ಅಡಿಯಲ್ಲಿ ಅದೇ ಸಕ್ರಿಯ ರಾಸಾಯನಿಕ ಅಂಶ ಮತ್ತು ಚಿಕಿತ್ಸಕ ಸಾಮರ್ಥ್ಯ.",
    saverGenericIpSaltLabel: "ಜೆನೆರಿಕ್ IP ಸಾಲ್ಟ್",
    saverJanAushadhiShort: "ಜನೌಷಧಿ",
    saverYouSaveLabel: "ನಿಮ್ಮ ಉಳಿತಾಯ",

    // SafetyPage
    safetyPageTitle: "ಕ್ಲಿನಿಕಲ್ ಸುರಕ್ಷತೆ ಮತ್ತು ನಿಯಮಗಳು (Guardrails)",
    safetyPageSubtitle:
      "ಮೆಡ್‌ಸೇಫ್ ಇಂಡಿಯಾ ವೈದ್ಯಕೀಯ ಸುರಕ್ಷತೆ ಮತ್ತು ಡೇಟಾ ನಿಖರತೆಯನ್ನು ಹೇಗೆ ಖಚಿತಪಡಿಸುತ್ತದೆ ಎಂಬುದನ್ನು ತಿಳಿಯಿರಿ.",
    safetyZeroLlmTitle: "ಶೂನ್ಯ LLM ವೈದ್ಯಕೀಯ ನಿರ್ಧಾರ ನಿಯಮ",
    safetyZeroLlmBody:
      "ಮೆಡ್‌ಸೇಫ್ ಇಂಡಿಯಾ ಲಾರ್ಜ್ ಲಾಂಗ್ವೇಜ್ ಮಾಡೆಲ್‌ಗಳು (LLM) ಔಷಧ ಮಾಹಿತಿ, ಅಡ್ಡಪರಿಣಾಮಗಳು ಅಥವಾ ಪ್ರಮಾಣವನ್ನು ನಿರ್ಧರಿಸುವುದನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧಿಸುತ್ತದೆ. ಪರಿಶೀಲಿಸಿದ ಸತ್ಯಗಳನ್ನು ಸರಳ ಭಾಷೆಗೆ ಅನುವಾದಿಸಲು ಮಾತ್ರ AI ಬಳಸಲಾಗುತ್ತದೆ.",
    safetyVerifiedSourcesTitle: "ಪರಿಶೀಲಿಸಿದ ಡೇಟಾ ಮೂಲಗಳು",
    safetyVerifiedSourcesBody:
      "ಎಲ್ಲಾ ಬ್ರಾಂಡ್ ಹೆಸರುಗಳು, ಸಕ್ರಿಯ ಅಂಶಗಳು (Salts), ಪ್ರಮಾಣ ಮತ್ತು ತಯಾರಕರ ವಿವರಗಳು ಪರಿಶೀಲಿಸಿದ ಭಾರತೀಯ ಔಷಧ ಡೇಟಾಸೆಟ್‌ಗಳಿಂದ ಮಾತ್ರ ಬರುತ್ತವೆ.",
    safetyOcrGuardrailsTitle: "OCR ಸುರಕ್ಷತಾ ಪರಿಶೀಲನೆ",
    safetyOcrGuardrailsBody:
      "ಬಳಕೆದಾರರ ಸ್ಪಷ್ಟ ದೃಢೀಕರಣ ಸಿಗುವವರೆಗೆ ಚೀಟಿಯ ಸ್ಕ್ಯಾನ್ (OCR) ಫಲಿತಾಂಶಗಳನ್ನು ಕೇವಲ ಊಹೆಗಳೆಂದು ಪರಿಗಣಿಸಲಾಗುತ್ತದೆ.",

    // DailyPillOrganizer
    pillOrganizerTitle: "ದೈನಂದಿನ ಔಷಧ ವೇಳಾಪಟ್ಟಿ (Pill Organizer)",
    pillOrganizerSubtitle:
      "ಬೆಳಿಗ್ಗೆ, ಮಧ್ಯಾಹ್ನ ಮತ್ತು ರಾತ್ರಿಯ ಔಷಧ ವೇಳಾಪಟ್ಟಿ — ಬದಲಾಯಿಸಲು M / A / N ಅಥವಾ ಊಟದ ಬ್ಯಾಡ್ಜ್ ಒತ್ತಿರಿ",
    pillShareScheduleBtn: "WhatsApp ನಲ್ಲಿ ವೇಳಾಪಟ್ಟಿ ಹಂಚಿಕೊಳ್ಳಿ",
    pillCustomizeTimingLabel: "ಸಮಯ ಹೊಂದಿಸಿ (ಬೆಳಿಗ್ಗೆ • ಮಧ್ಯಾಹ್ನ • ರಾತ್ರಿ)",
    pillShortMorning: "ಬೆ",
    pillShortAfternoon: "ಮ",
    pillShortNight: "ರಾ",
    pillNoTabletsScheduled: "ಯಾವುದೇ ಮಾತ್ರೆ ನಿಗದಿಯಾಗಿಲ್ಲ",
    pillSwitchMealTooltip: "ಊಟದ ಸಮಯವನ್ನು ಬದಲಾಯಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    pillNoneLabel: "ಯಾವುದೂ ಇಲ್ಲ",
    pillWhatsappHeader: "ಮೆಡ್‌ಸೇಫ್ ಇಂಡಿಯಾ — ದೈನಂದಿನ ಔಷಧ ವೇಳಾಪಟ್ಟಿ",
    pillWhatsappFooter: "ಮೆಡ್‌ಸೇಫ್ ಇಂಡಿಯಾ ವೈದ್ಯಕೀಯ ಸುರಕ್ಷತಾ ಸಹಾಯಕದಿಂದ ರಚಿಸಲಾಗಿದೆ",
    morning: "ಬೆಳಿಗ್ಗೆ",
    afternoon: "ಮಧ್ಯಾಹ್ನ",
    night: "ರಾತ್ರಿ",
    beforeBreakfast: "ತಿಂಡಿಗೆ ಮುಂಚೆ",
    afterBreakfast: "ತಿಂಡಿಯ ನಂತರ",
    beforeLunch: "ಮಧ್ಯಾಹ್ನದ ಊಟಕ್ಕೆ ಮುಂಚೆ",
    afterLunch: "ಮಧ್ಯಾಹ್ನದ ಊಟದ ನಂತರ",
    beforeDinner: "ರಾತ್ರಿ ಊಟಕ್ಕೆ ಮುಂಚೆ",
    afterDinner: "ರಾತ್ರಿ ಊಟದ ನಂತರ",
    afterFood: "ಊಟದ ನಂತರ",
    shareWhatsapp: "WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ",
    listenSummary: "ಧ್ವನಿ ವಿವರಣೆ ಕೇಳಿ",

    // CaregiverAudioSummary
    audioSummaryTitle: "ಆರೈಕೆದಾರರ ಸಾರಾಂಶ ಮತ್ತು ಧ್ವನಿ ವಿವರಣೆ",
    audioSummarySubtitle:
      "ಹಿರಿಯ ರೋಗಿಗಳು ಮತ್ತು ಕುಟುಂಬದ ಆರೈಕೆದಾರರಿಗಾಗಿ ಇಂಗ್ಲಿಷ್, ಕನ್ನಡ ಅಥವಾ ಹಿಂದಿಯಲ್ಲಿ ಕೇಳಿ",
    audioTtsUnsupported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ವಿವರಣೆ ಲಭ್ಯವಿಲ್ಲ. Chrome ಅಥವಾ Edge ಬಳಸಿ.",
    audioStopBtn: "ನಿಲ್ಲಿಸಿ",
    audioCopyTooltip: "WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಲು ಸಾರಾಂಶವನ್ನು ಕಾಪಿ ಮಾಡಿ",
    audioCopyBtn: "ಕಾಪಿ ಮಾಡಿ",
    audioCopiedBtn: "ಕಾಪಿಯಾಗಿದೆ",

    // Shared Lookup & Pricing Fallbacks
    searchPlaceholder: "ಔಷಧಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಉದಾ: Dolo 650, Pan-D)...",
    primaryUses: "ಮುಖ್ಯ ಉಪಯೋಗಗಳು",
    precautions: "ಮುಖ್ಯ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು",
    genericSavings: "ಜನೌಷಧಿ ಜೆನೆರಿಕ್ ಉಳಿತಾಯ",
    brandedPrice: "ಬ್ರಾಂಡೆಡ್ ಬೆಲೆ (MRP)",
    janAushadhiPrice: "ಜನೌಷಧಿ ಬೆಲೆ",
    estimatedSavings: "ಅಂದಾಜು ಚೀಟಿ ಉಳಿತಾಯ",
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