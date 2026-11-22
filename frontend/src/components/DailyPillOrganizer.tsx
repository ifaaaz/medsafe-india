import React, { useState, useEffect } from 'react';
import { Sunrise, Sun, Moon, Utensils, Share2, CalendarClock } from 'lucide-react';

interface DailyPillOrganizerProps {
  medicines: string[];
}

type SlotKey = 'morning' | 'afternoon' | 'night';

interface MedicineScheduleConfig {
  name: string;
  slots: Record<SlotKey, boolean>;
  mealTiming: 'Before Breakfast' | 'After Food' | 'With Dinner';
}

// Schedules every medicine 2 times (Morning + Night) or 3 times (Morning + Afternoon + Night)
function getDefaultSchedule(med: string, index: number): MedicineScheduleConfig {
  const lower = med.toLowerCase();

  // PPIs / Gastroprotective agents -> 2 times daily (Morning Before Breakfast & Night)
  if (
    lower.includes('pan') ||
    lower.includes('omez') ||
    lower.includes('omeprazole') ||
    lower.includes('pantop') ||
    lower.includes('rabeprazole') ||
    lower.includes('esomeprazole')
  ) {
    return {
      name: med,
      slots: { morning: true, afternoon: false, night: true },
      mealTiming: 'Before Breakfast',
    };
  }

  // Explicitly 3-times-daily (TID) medications -> Morning + Afternoon + Night
  if (
    lower.includes('dolo') ||
    lower.includes('paracetamol') ||
    lower.includes('combiflam') ||
    lower.includes('flagyl') ||
    lower.includes('calcium') ||
    lower.includes('d3') ||
    lower.includes('vit') ||
    lower.includes('metformin')
  ) {
    return {
      name: med,
      slots: { morning: true, afternoon: true, night: true },
      mealTiming: 'After Food',
    };
  }

  // Explicitly 2-times-daily (BD) medications -> Morning + Night
  if (
    lower.includes('augmentin') ||
    lower.includes('zerodol') ||
    lower.includes('warfarin') ||
    lower.includes('acitrom') ||
    lower.includes('aspirin') ||
    lower.includes('ecosprin') ||
    lower.includes('atorva') ||
    lower.includes('rosuva')
  ) {
    return {
      name: med,
      slots: { morning: true, afternoon: false, night: true },
      mealTiming: 'After Food',
    };
  }

  // Any other random / unrecognized drug -> alternates between 3 times (M+A+N) and 2 times (M+N)
  const isThreeTimesDaily = index % 2 === 0;
  return {
    name: med,
    slots: {
      morning: true,
      afternoon: isThreeTimesDaily,
      night: true,
    },
    mealTiming: 'After Food',
  };
}

export const DailyPillOrganizer: React.FC<DailyPillOrganizerProps> = ({ medicines }) => {
  const [schedules, setSchedules] = useState<MedicineScheduleConfig[]>([]);

  useEffect(() => {
    setSchedules((prev) => {
      const existingMap = new Map(prev.map((item) => [item.name, item]));
      return medicines.map((med, idx) => existingMap.get(med) || getDefaultSchedule(med, idx));
    });
  }, [medicines]);

  if (medicines.length === 0) return null;

  const toggleSlot = (medName: string, slot: SlotKey) => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.name === medName
          ? {
              ...item,
              slots: {
                ...item.slots,
                [slot]: !item.slots[slot],
              },
            }
          : item
      )
    );
  };

  const cycleMealTiming = (medName: string) => {
    const order: MedicineScheduleConfig['mealTiming'][] = [
      'After Food',
      'Before Breakfast',
      'With Dinner',
    ];
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.name !== medName) return item;
        const nextIdx = (order.indexOf(item.mealTiming) + 1) % order.length;
        return { ...item, mealTiming: order[nextIdx] };
      })
    );
  };

  const morning = schedules.filter((s) => s.slots.morning);
  const afternoon = schedules.filter((s) => s.slots.afternoon);
  const night = schedules.filter((s) => s.slots.night);

  const handleWhatsAppShare = () => {
    const formatList = (list: MedicineScheduleConfig[]) =>
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

  const slots: {
    key: SlotKey;
    title: string;
    timeRange: string;
    icon: typeof Sunrise;
    accent: string;
    badge: string;
    iconColor: string;
    items: MedicineScheduleConfig[];
  }[] = [
    {
      key: 'morning',
      title: 'Morning',
      timeRange: '8:00 AM – 9:30 AM',
      icon: Sunrise,
      accent: 'border-amber-200 bg-amber-50/60',
      badge: 'bg-amber-100 text-amber-800',
      iconColor: 'text-amber-600',
      items: morning,
    },
    {
      key: 'afternoon',
      title: 'Afternoon',
      timeRange: '1:00 PM – 2:30 PM',
      icon: Sun,
      accent: 'border-sky-200 bg-sky-50/60',
      badge: 'bg-sky-100 text-sky-800',
      iconColor: 'text-sky-600',
      items: afternoon,
    },
    {
      key: 'night',
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
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#041833] to-[#082A59] text-emerald-400 shrink-0 shadow-xs">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Visual Daily Pill Organizer
            </h3>
            <p className="text-xs text-slate-500">
              2x / 3x daily Morning, Afternoon &amp; Night schedule — tap M / A / N pills to adjust
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

      {/* Quick Interactive Frequency Customizer Bar */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Customize Timing (Morning • Afternoon • Night)
        </p>
        <div className="flex flex-wrap gap-2">
          {schedules.map((item) => (
            <div
              key={item.name}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs"
            >
              <span className="text-xs font-bold text-slate-800 max-w-[135px] truncate">
                {item.name}
              </span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { key: 'morning', label: 'M' },
                    { key: 'afternoon', label: 'A' },
                    { key: 'night', label: 'N' },
                  ] as const
                ).map(({ key, label }) => {
                  const active = item.slots[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleSlot(item.name, key)}
                      title={`Toggle ${key} dose for ${item.name}`}
                      className={`w-6 h-6 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                        active
                          ? 'bg-[#041833] text-emerald-400 shadow-2xs'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Column Pillbox Grid */}
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
                      <button
                        type="button"
                        onClick={() => cycleMealTiming(pill.name)}
                        title="Click to switch meal timing"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 cursor-pointer transition ${
                          pill.mealTiming === 'Before Breakfast'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <Utensils className="w-2.5 h-2.5" />
                        <span>{pill.mealTiming}</span>
                      </button>
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