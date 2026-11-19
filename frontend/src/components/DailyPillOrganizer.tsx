import React from 'react';
import { Sunrise, Sun, Moon, Utensils, Share2, CalendarClock } from 'lucide-react';

interface DailyPillOrganizerProps {
  medicines: string[];
}

interface PillSlotItem {
  name: string;
  mealTiming: 'Before Breakfast' | 'After Food' | 'With Dinner';
}

// Smart Indian clinical schedule defaults so every scanned medicine maps cleanly to a pillbox slot
function classifyDailySchedule(medicines: string[]): {
  morning: PillSlotItem[];
  afternoon: PillSlotItem[];
  night: PillSlotItem[];
} {
  const morning: PillSlotItem[] = [];
  const afternoon: PillSlotItem[] = [];
  const night: PillSlotItem[] = [];

  medicines.forEach((med) => {
    const lower = med.toLowerCase();

    // PPIs / Antacids -> Empty stomach before breakfast
    if (lower.includes('pan') || lower.includes('omez') || lower.includes('pantop') || lower.includes('rabeprazole')) {
      morning.push({ name: med, mealTiming: 'Before Breakfast' });
      return;
    }

    // Statins / Montelukast / Blood thinners -> Night / Evening
    if (lower.includes('atorva') || lower.includes('rosuva') || lower.includes('montair') || lower.includes('acitrom')) {
      night.push({ name: med, mealTiming: 'With Dinner' });
      return;
    }

    // Antibiotics / Analgesics (BD / TID) -> Morning + Night (and Afternoon for SOS/pain)
    if (lower.includes('augmentin') || lower.includes('combiflam') || lower.includes('zerodol') || lower.includes('dolo') || lower.includes('flagyl')) {
      morning.push({ name: med, mealTiming: 'After Food' });
      if (lower.includes('dolo') || lower.includes('combiflam') || lower.includes('flagyl')) {
        afternoon.push({ name: med, mealTiming: 'After Food' });
      }
      night.push({ name: med, mealTiming: 'After Food' });
      return;
    }

    // Antihypertensives / Cardiac (Telma, Ecosprin, Clopilet) -> Morning After Food
    morning.push({ name: med, mealTiming: 'After Food' });
  });

  return { morning, afternoon, night };
}

export const DailyPillOrganizer: React.FC<DailyPillOrganizerProps> = ({ medicines }) => {
  if (medicines.length === 0) return null;

  const { morning, afternoon, night } = classifyDailySchedule(medicines);

  const handleWhatsAppShare = () => {
    const formatList = (list: PillSlotItem[]) =>
      list.length > 0 ? list.map((i) => `• ${i.name} (${i.mealTiming})`).join('\n') : '• None';

    const message = [
      '*MedSafe India — Daily Pill Schedule*',
      '',
      '*Morning:*',
      formatList(morning),
      '',
      '*Afternoon:*',
      formatList(afternoon),
      '',
      '*Night:*',
      formatList(night),
      '',
      '_Generated via MedSafe India Clinical Safety Assistant_',
    ].join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const slots = [
    {
      title: 'Morning',
      timeRange: '8:00 AM – 9:30 AM',
      icon: Sunrise,
      accent: 'border-amber-200 bg-amber-50/60',
      badge: 'bg-amber-100 text-amber-800',
      iconColor: 'text-amber-600',
      items: morning,
    },
    {
      title: 'Afternoon',
      timeRange: '1:00 PM – 2:30 PM',
      icon: Sun,
      accent: 'border-sky-200 bg-sky-50/60',
      badge: 'bg-sky-100 text-sky-800',
      iconColor: 'text-sky-600',
      items: afternoon,
    },
    {
      title: 'Night',
      timeRange: '8:30 PM – 10:00 PM',
      icon: Moon,
      accent: 'border-indigo-200 bg-indigo-50/60',
      badge: 'bg-indigo-100 text-indigo-800',
      iconColor: 'text-indigo-600',
      items: night,
    },
  ];

  return (
    <section className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-700 text-white shrink-0">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Visual Daily Pill Organizer
            </h3>
            <p className="text-xs text-slate-500">
              Structured Morning, Afternoon &amp; Night meal-timing schedule for patients &amp; caregivers
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Schedule on WhatsApp</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {slots.map(({ title, timeRange, icon: Icon, accent, badge, iconColor, items }) => (
          <div key={title} className={`p-3.5 rounded-2xl border ${accent} flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                  <span className="text-sm font-bold text-slate-900">{title}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge}`}>
                  {timeRange}
                </span>
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No tablets scheduled
                </p>
              ) : (
                <ul className="space-y-2">
                  {items.map((pill, idx) => (
                    <li
                      key={`${pill.name}-${idx}`}
                      className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-bold text-slate-800 truncate">{pill.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                          pill.mealTiming === 'Before Breakfast'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <Utensils className="w-2.5 h-2.5" />
                        <span>{pill.mealTiming}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};