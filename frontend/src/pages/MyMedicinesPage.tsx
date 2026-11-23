import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface HistoryItem {
  id: number;
  brand_name: string;
  generic_name: string | null;
  strength: string | null;
  active_ingredients: string[];
  source_action: string;
  notes: string | null;
  recorded_at: string;
}

export const MyMedicinesPage: React.FC = () => {
  const { t } = useLanguage();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Manual Add Form States
  const [brandName, setBrandName] = useState('');
  const [saltName, setSaltName] = useState('');
  const [strength, setStrength] = useState('');
  const [notes, setNotes] = useState('');

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/v1/history/`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch medication history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Dynamically detect duplicate active salts across recorded medicines
  const duplicateSalts = useMemo(() => {
    const saltMap: Record<string, string[]> = {};
    history.forEach((item) => {
      item.active_ingredients.forEach((ing) => {
        const key = ing.trim().toLowerCase();
        if (!saltMap[key]) saltMap[key] = [];
        if (!saltMap[key].includes(item.brand_name)) {
          saltMap[key].push(item.brand_name);
        }
      });
    });

    return Object.entries(saltMap)
      .filter(([, brands]) => brands.length > 1)
      .map(([salt, brands]) => ({
        salt: salt.charAt(0).toUpperCase() + salt.slice(1),
        brands,
      }));
  }, [history]);

  const handleDeleteItem = async (id: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/v1/history/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(t.myMedsClearConfirm)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/v1/history/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    const ingredientsList = saltName
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/v1/history/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandName.trim(),
          generic_name: saltName.trim() || brandName.trim(),
          strength: strength.trim() || 'Standard',
          active_ingredients: ingredientsList,
          source_action: 'Manual Entry',
          notes: notes.trim() || null,
        }),
      });
      if (res.ok) {
        setBrandName('');
        setSaltName('');
        setStrength('');
        setNotes('');
        setShowAddModal(false);
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to add medicine:', err);
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t.myMedsPageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t.myMedsPageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
            >
              {t.myMedsClearAllBtn}
            </button>
          )}
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            {t.myMedsAddBtn}
          </button>
        </div>
      </div>

      {/* Manual Add Form */}
      {showAddModal && (
        <form
          onSubmit={handleManualAdd}
          className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm mb-6 space-y-4"
        >
          <h2 className="text-sm font-bold text-gray-800">{t.myMedsModalTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder={t.myMedsBrandPlaceholder}
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
            />
            <input
              type="text"
              placeholder={t.myMedsSaltPlaceholder}
              value={saltName}
              onChange={(e) => setSaltName(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
            />
            <input
              type="text"
              placeholder={t.myMedsStrengthPlaceholder}
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
            />
            <input
              type="text"
              placeholder={t.myMedsNotesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              {t.myMedsCancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 text-sm font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 cursor-pointer"
            >
              {t.myMedsSaveBtn}
            </button>
          </div>
        </form>
      )}

      {/* Dynamic Duplicate Active Ingredient Warning */}
      {duplicateSalts.length > 0 && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-900">
          <div className="font-bold text-sm flex items-center gap-2 text-red-700">
            <span>!</span> {t.myMedsDuplicateTitle}
          </div>
          {duplicateSalts.map((dup) => (
            <p key={dup.salt} className="text-xs text-red-800 mt-1">
              {t.myMedsDuplicatePrefix} <strong>{dup.salt}</strong> ({dup.brands.join(', ')}).{' '}
              {t.myMedsDuplicateSuffix}
            </p>
          ))}
        </div>
      )}

      {/* History List */}
      {loading ? (
        <div className="p-10 text-center text-sm text-gray-500">{t.myMedsLoading}</div>
      ) : history.length === 0 ? (
        <div className="p-10 rounded-xl border border-gray-200 bg-white text-center text-sm text-gray-500">
          {t.myMedsEmptyState}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item) => {
            const isDuplicate = item.active_ingredients.some((ing) =>
              duplicateSalts.some((d) => d.salt.toLowerCase() === ing.toLowerCase())
            );

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{item.brand_name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.strength ? `${item.strength} • ` : ''}
                        <span className="font-medium text-emerald-700">{item.source_action}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDuplicate ? (
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
                          {t.myMedsDuplicateBadge}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {t.myMedsRecordedBadge}
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        title={t.myMedsDeleteBtn}
                        className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                      >
                        {t.myMedsDeleteBtn}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 mt-3">
                    <span className="font-semibold">{t.myMedsActiveSaltLabel}:</span>{' '}
                    {item.active_ingredients.length > 0
                      ? item.active_ingredients.join(', ')
                      : item.generic_name || 'N/A'}
                  </p>

                  {item.notes && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t.myMedsNoteLabel}: {item.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                  {t.myMedsRecordedOnLabel} {formatDate(item.recorded_at)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyMedicinesPage;