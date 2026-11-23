import React, { useState, useMemo } from 'react';
import {
  Utensils,
  FlaskConical,
  Cpu,
  AlertTriangle,
  HeartPulse,
  ShieldAlert,
  Plus,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LifestyleConditionCheckerProps {
  medicines: string[];
  initialConditions?: string[];
}

interface ClinicalRule {
  keywords: string[];
  drugLabel: string;
  mechanismTitle: string;
  mechanismDetail: string;
  indianFoodAlert: string;
  labAlert: string;
  conditionContraindications: { condition: string; warning: string }[];
  severity: 'critical' | 'moderate';
}

const CLINICAL_PHARMACOLOGY_RULES: ClinicalRule[] = [
  {
    keywords: ['warfarin', 'warf', 'acitrom', 'nicoumalone'],
    drugLabel: 'Warfarin (Anticoagulant)',
    mechanismTitle: 'VKORC1 Inhibition & CYP2C9 Metabolism',
    mechanismDetail:
      'Blocks Vitamin K epoxide reductase (clotting factors II, VII, IX, X). Metabolized primarily via hepatic CYP2C9 — enzyme inhibitors like Fluconazole or NSAID displacement cause rapid, dangerous INR spikes within 48 hours.',
    indianFoodAlert:
      'Keep Vitamin K intake steady: sudden excess Palak (spinach), Methi (fenugreek), Sarson, or Coriander chutney reduces Warfarin efficacy, while fasting/ginger/garlic supplements increase bleeding risk.',
    labAlert:
      'Mandatory Lab Check: Monitor PT / INR every 2–4 weeks (target INR 2.0–3.0) and check within 3–5 days whenever adding or stopping any co-prescribed drug.',
    conditionContraindications: [
      { condition: 'ulcer', warning: 'High risk of life-threatening gastrointestinal hemorrhage.' },
      { condition: 'bleeding', warning: 'Contraindicated in active bleeding disorders.' },
      { condition: 'pregnancy', warning: 'Teratogenic — strictly contraindicated in pregnancy.' },
    ],
    severity: 'critical',
  },
  {
    keywords: ['aspirin', 'ecosprin', 'disprin', 'clopidogrel', 'clopilet'],
    drugLabel: 'Aspirin / Antiplatelet',
    mechanismTitle: 'Irreversible COX-1 Platelet Acetylation',
    mechanismDetail:
      'Permanently blocks thromboxane A2 synthesis in platelets for their 7–10 day lifespan and strips protective gastric mucosal prostaglandins.',
    indianFoodAlert:
      'Take strictly after breakfast/meals with a full glass of water. Avoid alcohol, spicy/acidic foods on an empty stomach, and excess turmeric/garlic concentrates.',
    labAlert:
      'Monitor Complete Blood Count (Hemoglobin / Platelets) and stool occult blood if prolonged dual antiplatelet or NSAID therapy is used.',
    conditionContraindications: [
      { condition: 'ulcer', warning: 'Severe risk of gastric ulcer perforation and GI bleeding.' },
      { condition: 'asthma', warning: 'Can trigger Aspirin-Exacerbated Respiratory Disease (bronchospasm).' },
      { condition: 'kidney', warning: 'Reduces renal prostaglandin blood flow; use lowest dose.' },
    ],
    severity: 'critical',
  },
  {
    keywords: ['ibuprofen', 'brufen', 'combiflam', 'diclofenac', 'voveran', 'aceclofenac', 'zerodol', 'naproxen'],
    drugLabel: 'NSAID (Ibuprofen / Diclofenac / Aceclofenac)',
    mechanismTitle: 'Non-Selective COX-1 & COX-2 Inhibition + Renal Afferent Vasoconstriction',
    mechanismDetail:
      'Inhibits prostaglandin synthesis (reducing gastric mucus protection and renal blood flow) while displacing protein-bound drugs like Warfarin.',
    indianFoodAlert:
      'Never take on an empty stomach — take after meals (roti/rice/milk). Avoid alcohol and strong black tea/coffee immediately after dosing to prevent gastritis.',
    labAlert:
      'Monitor Serum Creatinine, eGFR, and Blood Pressure during prolonged use (>5–7 days), especially in elderly or diabetic patients.',
    conditionContraindications: [
      { condition: 'kidney', warning: 'High risk of acute kidney injury (nephrotoxicity).' },
      { condition: 'hypertension', warning: 'Causes sodium/water retention and blunts BP medications.' },
      { condition: 'ulcer', warning: 'High risk of peptic ulcer bleeding.' },
      { condition: 'heart', warning: 'Increases fluid retention and cardiovascular risk.' },
    ],
    severity: 'critical',
  },
  {
    keywords: ['fluconazole', 'forcan', 'zocon', 'itraconazole', 'ketoconazole'],
    drugLabel: 'Fluconazole (Azole Antifungal)',
    mechanismTitle: 'Potent Hepatic CYP2C9 & CYP3A4 Enzyme Inhibition',
    mechanismDetail:
      'Strongly inhibits cytochrome P450 (CYP2C9 / CYP3A4) liver enzymes, slowing breakdown of Warfarin, sulfonylureas, and statins — causing toxic plasma accumulation.',
    indianFoodAlert:
      'Can be taken with or without food. Avoid alcohol during therapy to prevent additive hepatic strain.',
    labAlert:
      'Check Liver Function Tests (SGOT/SGPT) if prescribed multi-day courses, and urgent PT/INR check if co-prescribed with Warfarin.',
    conditionContraindications: [
      { condition: 'liver', warning: 'Requires dose adjustment and hepatic enzyme monitoring.' },
      { condition: 'heart', warning: 'Monitor for QT interval prolongation in cardiac patients.' },
    ],
    severity: 'moderate',
  },
  {
    keywords: ['metformin', 'glycomet', 'glimepiride', 'janumet'],
    drugLabel: 'Metformin / Oral Antidiabetic',
    mechanismTitle: 'AMPK Activation & Hepatic Gluconeogenesis Suppression',
    mechanismDetail:
      'Decreases hepatic glucose production and improves peripheral insulin sensitivity without stimulating insulin secretion.',
    indianFoodAlert:
      'Take with meals (dal/roti/sabzi) to prevent metallic taste and GI upset. Avoid skipping meals or excessive alcohol (risk of lactic acidosis/hypoglycemia).',
    labAlert:
      'Monitor HbA1c every 3 months, Serum Vitamin B12 annually, and eGFR / Serum Creatinine (hold if eGFR < 30 mL/min).',
    conditionContraindications: [
      { condition: 'kidney', warning: 'Contraindicated in severe renal impairment (eGFR < 30).' },
    ],
    severity: 'moderate',
  },
  {
    keywords: ['paracetamol', 'dolo', 'crocin', 'calpol', 'pacimol'],
    drugLabel: 'Paracetamol (Acetaminophen)',
    mechanismTitle: 'Central COX-3 / Serotonergic Pathway & NAPQI Hepatic Metabolism',
    mechanismDetail:
      'Acts centrally to reduce fever and pain. Metabolized in the liver via glucuronidation; overdose depletes glutathione and forms toxic NAPQI.',
    indianFoodAlert:
      'Safe before or after food. Strictly avoid alcohol and verify no duplicate Paracetamol exists in combination cold/pain tablets (e.g., Combiflam Plus / Sumo).',
    labAlert:
      'Max adult limit: 3,000–4,000 mg/day. Monitor LFTs (AST/ALT) in chronic liver disease.',
    conditionContraindications: [
      { condition: 'liver', warning: 'Reduce maximum daily dose to ≤ 2,000 mg/day in liver disease.' },
    ],
    severity: 'moderate',
  },
  {
    keywords: ['atorvastatin', 'rosuvastatin', 'atorva', 'rosuvas', 'lipitor'],
    drugLabel: 'Statin (Atorvastatin / Rosuvastatin)',
    mechanismTitle: 'HMG-CoA Reductase Inhibition & CYP3A4 Metabolism',
    mechanismDetail:
      'Blocks hepatic cholesterol synthesis. Atorvastatin is metabolized via CYP3A4 — inhibitors like Azole antifungals or Macrolides increase muscle toxicity (myopathy) risk.',
    indianFoodAlert:
      'Best taken at night (cholesterol synthesis peaks overnight). Avoid excess alcohol and grapefruit/citrus concentrates.',
    labAlert:
      'Monitor Lipid Profile every 3–6 months, Liver Function Tests (SGOT/SGPT), and Creatine Kinase (CK) if unexplained muscle pain occurs.',
    conditionContraindications: [
      { condition: 'liver', warning: 'Contraindicated in active liver disease or unexplained persistent transaminase elevation.' },
    ],
    severity: 'moderate',
  },
  {
    keywords: ['pantoprazole', 'omeprazole', 'rabeprazole', 'pan-d', 'pan 40', 'razo', 'omez', 'pantocid'],
    drugLabel: 'Proton Pump Inhibitor (Pantoprazole / Rabeprazole)',
    mechanismTitle: 'Irreversible Gastric H+/K+ ATPase Proton Pump Blockade',
    mechanismDetail:
      'Suppresses final-step gastric acid secretion. Prolonged use reduces gastric acidity required for Vitamin B12, Magnesium, and Calcium absorption.',
    indianFoodAlert:
      'Take 30–45 minutes BEFORE breakfast on an empty stomach for maximum pump activation. Avoid spicy/oily late-night meals and excess caffeine.',
    labAlert:
      'Monitor Serum Vitamin B12 and Magnesium if used continuously for >6–12 months.',
    conditionContraindications: [],
    severity: 'moderate',
  },
  {
    keywords: ['telmisartan', 'losartan', 'amlodipine', 'telma', 'stamlo', 'enalapril', 'ramipril'],
    drugLabel: 'Antihypertensive (ARB / ACE Inhibitor / CCB)',
    mechanismTitle: 'RAAS Angiotensin Receptor Blockade / Vascular Calcium Channel Blockade',
    mechanismDetail:
      'Relaxes arterial smooth muscle and reduces aldosterone-mediated sodium retention. Combining with NSAIDs (Ibuprofen/Diclofenac) blunts BP control and stresses kidneys.',
    indianFoodAlert:
      'Limit high-sodium Indian pickles (achar), papad, processed snacks, and potassium-rich salt substitutes (low-sodium salt) due to hyperkalemia risk.',
    labAlert:
      'Monitor Home Blood Pressure daily, Serum Potassium, and Serum Creatinine / eGFR 2–4 weeks after starting or dose changes.',
    conditionContraindications: [
      { condition: 'kidney', warning: 'Monitor Serum Potassium and Creatinine closely for hyperkalemia or eGFR drop.' },
    ],
    severity: 'moderate',
  },
  {
    keywords: ['azithromycin', 'amoxicillin', 'augmentin', 'cefixime', 'ciprofloxacin', 'azithral', 'taxim'],
    drugLabel: 'Antibiotic (Macrolide / Beta-Lactam / Fluoroquinolone)',
    mechanismTitle: 'Bacterial Cell Wall / Protein Synthesis Inhibition',
    mechanismDetail:
      'Eradicates susceptible bacterial pathogens. Complete the full prescribed course even if fever subsides early to prevent antimicrobial resistance.',
    indianFoodAlert:
      'Include probiotic curd/buttermilk (chaas) 2 hours apart from antibiotic doses to prevent antibiotic-associated diarrhea. Avoid dairy/calcium within 2 hours of Ciprofloxacin.',
    labAlert:
      'Monitor for persistent diarrhea, skin rash, or hepatic transaminase elevation on prolonged courses.',
    conditionContraindications: [
      { condition: 'liver', warning: 'Macrolides/Augmentin require hepatic caution in pre-existing liver impairment.' },
    ],
    severity: 'moderate',
  },
];

const QUICK_CONDITIONS = [
  'Peptic Ulcer / Acidity',
  'Kidney Disease',
  'Hypertension',
  'Liver Disease',
  'Diabetes',
];

export const LifestyleConditionChecker: React.FC<LifestyleConditionCheckerProps> = ({
  medicines,
  initialConditions = [],
}) => {
  const { lang } = useLanguage();
  const [conditions, setConditions] = useState<string[]>(initialConditions);
  const [customCondition, setCustomCondition] = useState('');

  const labels = useMemo(() => {
    if (lang === 'hi') {
      return {
        sectionTitle: 'क्लिनिकल फार्माकोलॉजी, भारतीय आहार और लैब अलर्ट',
        sectionSub: 'दवाओं के काम करने का तरीका (CYP एंजाइम), भोजन चेतावनी और ज़रूरी जांचें',
        patientProfile: 'मरीज़ की स्वास्थ्य स्थिति:',
        addConditionPlaceholder: 'बीमारी जोड़ें (जैसे Ulcer, Kidney)...',
        mechanismLabel: 'क्लिनिकल मैकेनिज्म (Pharmacology)',
        foodLabel: 'भारतीय भोजन और जीवनशैली चेतावनी',
        labLabel: 'अनिवार्य लैब जांच (Lab Monitoring)',
        conditionConflict: 'स्वास्थ्य स्थिति चेतावनी',
        generalFallbackTitle: 'सामान्य क्लिनिकल निगरानी (General Regimen)',
        generalFallbackMechanism: 'लक्षित चिकित्सीय क्रिया (Targeted Therapeutic Pathway)',
        generalFallbackMechanismDetail:
          'यह दवा अपने निर्धारित चिकित्सीय मार्ग पर काम करती है। बिना डॉक्टर की सलाह के खुराक न बदलें।',
        generalFallbackFood:
          'डॉक्टर के निर्देशानुसार भोजन से पहले या बाद में एक गिलास पानी के साथ लें। शराब से बचें।',
        generalFallbackLab:
          'किसी भी असामान्य लक्षण या एलर्जी की स्थिति में अपने डॉक्टर या फार्मासिस्ट से संपर्क करें।',
      };
    }
    if (lang === 'kn') {
      return {
        sectionTitle: 'ಕ್ಲಿನಿಕಲ್ ಫಾರ್ಮಕಾಲಜಿ, ಭಾರತೀಯ ಆಹಾರ ಮತ್ತು ಲ್ಯಾಬ್ ಎಚ್ಚರಿಕೆಗಳು',
        sectionSub: 'ಔಷಧಿಗಳ ಕಾರ್ಯವಿಧಾನ (CYP ಕಿಣ್ವಗಳು), ಆಹಾರ ಎಚ್ಚರಿಕೆ ಮತ್ತು ಅಗತ್ಯ ಪರೀಕ್ಷೆಗಳು',
        patientProfile: 'ರೋಗಿಯ ಆರೋಗ್ಯ ಸ್ಥಿತಿ:',
        addConditionPlaceholder: 'ಆರೋಗ್ಯ ಸ್ಥಿತಿ ಸೇರಿಸಿ (ಉದಾ: Ulcer, Kidney)...',
        mechanismLabel: 'ಕ್ಲಿನಿಕಲ್ ಕಾರ್ಯವಿಧಾನ (Pharmacology)',
        foodLabel: 'ಭಾರತೀಯ ಆಹಾರ ಮತ್ತು ಜೀವನಶೈಲಿ ಎಚ್ಚರಿಕೆ',
        labLabel: 'ಕಡ್ಡಾಯ ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆ (Lab Alert)',
        conditionConflict: 'ಆರೋಗ್ಯ ಸ್ಥಿತಿ ಎಚ್ಚರಿಕೆ',
        generalFallbackTitle: 'ಸಾಮಾನ್ಯ ಕ್ಲಿನಿಕಲ್ ಮೇಲ್ವಿಚಾರಣೆ (General Regimen)',
        generalFallbackMechanism: 'ನಿರ್ದಿಷ್ಟ ಚಿಕಿತ್ಸಕ ಕಾರ್ಯವಿಧಾನ',
        generalFallbackMechanismDetail:
          'ಈ ಔಷಧವು ತನ್ನ ನಿಗದಿತ ಚಿಕಿತ್ಸಕ ಮಾರ್ಗದಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. ವೈದ್ಯರ ಸಲಹೆಯಿಲ್ಲದೆ ಪ್ರಮಾಣವನ್ನು ಬದಲಾಯಿಸಬೇಡಿ.',
        generalFallbackFood:
          'ವೈದ್ಯರ ಸೂಚನೆಯಂತೆ ಆಹಾರದ ಮೊದಲು ಅಥವಾ ನಂತರ ಒಂದು ಲೋಟ ನೀರಿನೊಂದಿಗೆ ಸೇವಿಸಿ. ಮದ್ಯಪಾನದಿಂದ ದೂರವಿರಿ.',
        generalFallbackLab:
          'ಯಾವುದೇ ಅಸಾಮಾನ್ಯ ಅಡ್ಡಪರಿಣಾಮ ಕಂಡುಬಂದರೆ ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      };
    }
    return {
      sectionTitle: 'Pharmacokinetic Mechanisms, Indian Dietary & Lab Alerts',
      sectionSub: 'CYP enzyme pathways, household food interactions, and mandatory lab monitoring',
      patientProfile: 'Patient Condition Profile:',
      addConditionPlaceholder: 'Add condition (e.g., Ulcer, Kidney)...',
      mechanismLabel: 'Pharmacokinetic Mechanism',
      foodLabel: 'Indian Dietary & Meal-Timing Alert',
      labLabel: 'Mandatory Lab Monitoring',
      conditionConflict: 'Patient Condition Alert',
      generalFallbackTitle: 'General Regimen Clinical Guidance',
      generalFallbackMechanism: 'Targeted Systemic Therapeutic Action',
      generalFallbackMechanismDetail:
        'Acts via its designated receptor/enzyme pathway. Maintain consistent daily dosing intervals and avoid abrupt discontinuation.',
      generalFallbackFood:
        'Take with a full glass of water following prescribed meal-timing instructions. Avoid alcohol while on active medication.',
      generalFallbackLab:
        'Report any new rash, persistent GI discomfort, or dizziness to your prescribing physician.',
    };
  }, [lang]);

  const matchedRules = useMemo(() => {
    const normalizedMeds = medicines.map((m) => m.toLowerCase());
    const found = CLINICAL_PHARMACOLOGY_RULES.filter((rule) =>
      rule.keywords.some((kw) => normalizedMeds.some((med) => med.includes(kw)))
    );

    if (found.length > 0) return found;

    // Fallback card so random/uncommon medicines still get structured clinical guidance
    return [
      {
        keywords: [],
        drugLabel: `${medicines.join(', ')} — ${labels.generalFallbackTitle}`,
        mechanismTitle: labels.generalFallbackMechanism,
        mechanismDetail: labels.generalFallbackMechanismDetail,
        indianFoodAlert: labels.generalFallbackFood,
        labAlert: labels.generalFallbackLab,
        conditionContraindications: [],
        severity: 'moderate' as const,
      },
    ];
  }, [medicines, labels]);

  // Detect combined CYP2C9 + Warfarin synergy when both are present
  const hasCypWarfarinSynergy = useMemo(() => {
    const lower = medicines.map((m) => m.toLowerCase());
    const hasWarfarin = lower.some((m) => m.includes('warfarin') || m.includes('warf'));
    const hasFluconazole = lower.some((m) => m.includes('fluconazole'));
    return hasWarfarin && hasFluconazole;
  }, [medicines]);

  const toggleCondition = (cond: string) => {
    setConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customCondition.trim();
    if (trimmed && !conditions.includes(trimmed)) {
      setConditions((prev) => [...prev, trimmed]);
    }
    setCustomCondition('');
  };

  if (medicines.length === 0) return null;

  return (
    <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-slate-50 via-indigo-50/35 to-sky-50/40 p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0 mt-0.5">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {labels.sectionTitle}
            </h3>
            <p className="text-xs text-slate-600">{labels.sectionSub}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 self-start sm:self-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          <FlaskConical className="w-3 h-3" />
          {matchedRules.length} Active Pharmacology {matchedRules.length === 1 ? 'Rule' : 'Rules'}
        </span>
      </div>

      {/* Special Highlight Banner: CYP2C9 Enzyme Inhibition Synergy */}
      {hasCypWarfarinSynergy && (
        <div className="p-3.5 rounded-xl bg-rose-950 text-white border border-rose-500/40 shadow-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <p className="font-bold text-rose-200">
              Critical Pharmacokinetic Alert: CYP2C9 Enzyme Inhibition Detected
            </p>
            <p className="text-slate-200 leading-relaxed text-xs">
              <strong>Fluconazole</strong> potently inhibits liver <strong>CYP2C9</strong> enzymes responsible for clearing <strong>Warfarin</strong>, causing Warfarin blood concentration and INR to surge within 48 hours. Immediate dose reduction &amp; INR monitoring required.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Patient Health Conditions Bar */}
      <div className="bg-white/90 rounded-xl p-3 border border-slate-200/80 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 mr-1">
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            {labels.patientProfile}
          </span>
          {QUICK_CONDITIONS.map((cond) => {
            const active = conditions.some((c) => c.toLowerCase() === cond.toLowerCase());
            return (
              <button
                key={cond}
                type="button"
                onClick={() => toggleCondition(cond)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70'
                }`}
              >
                {active ? '✓ ' : '+ '}
                {cond}
              </button>
            );
          })}
          {conditions
            .filter((c) => !QUICK_CONDITIONS.some((q) => q.toLowerCase() === c.toLowerCase()))
            .map((custom) => (
              <span
                key={custom}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500 text-slate-950 border border-amber-600"
              >
                {custom}
                <button
                  type="button"
                  onClick={() => toggleCondition(custom)}
                  className="hover:text-rose-800 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
        </div>

        <form onSubmit={handleAddCustom} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={customCondition}
            onChange={(e) => setCustomCondition(e.target.value)}
            placeholder={labels.addConditionPlaceholder}
            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </form>
      </div>

      {/* Detailed Pharmacology, Indian Food & Lab Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {matchedRules.map((rule) => {
          const matchedCondWarnings = rule.conditionContraindications.filter((cc) =>
            conditions.some((userCond) => userCond.toLowerCase().includes(cc.condition))
          );

          return (
            <div
              key={rule.drugLabel}
              className="rounded-xl bg-white border border-slate-200/90 p-3.5 shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                {/* Drug + Mechanism Header */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {rule.drugLabel}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                      rule.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {rule.severity === 'critical' ? 'High Vigilance' : 'Monitor'}
                  </span>
                </div>

                {/* Condition Contraindication Alert (if user has matching condition) */}
                {matchedCondWarnings.map((cw, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px] flex items-start gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>{labels.conditionConflict}:</strong> {cw.warning}
                    </span>
                  </div>
                ))}

                {/* 1. Pharmacokinetic Mechanism */}
                <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100">
                  <p className="text-[11px] font-bold text-indigo-900 flex items-center gap-1 mb-0.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    {labels.mechanismLabel}: {rule.mechanismTitle}
                  </p>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {rule.mechanismDetail}
                  </p>
                </div>

                {/* 2. Indian Dietary & Meal-Timing Warning */}
                <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70">
                  <p className="text-[11px] font-bold text-amber-950 flex items-center gap-1 mb-0.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    {labels.foodLabel}
                  </p>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    {rule.indianFoodAlert}
                  </p>
                </div>
              </div>

              {/* 3. Mandatory Lab Test Alert */}
              <div className="p-2.5 rounded-lg bg-sky-50/90 border border-sky-200/80">
                <p className="text-[11px] font-bold text-sky-950 flex items-center gap-1 mb-0.5">
                  <FlaskConical className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  {labels.labLabel}
                </p>
                <p className="text-[11px] text-sky-900 leading-relaxed">
                  {rule.labAlert}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};