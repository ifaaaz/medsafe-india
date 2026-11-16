import React, { useEffect, useState, useMemo } from 'react';

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
    if (!window.confirm('Clear all recorded medication history?')) return;
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
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Medicines &amp; History</h1>
          <p className="text-sm text-gray-600 mt-1">
            Automatically tracks your searched and scanned medications, checks duplicate active salts, and lets you manage records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              Clear All History
            </button>
          )}
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors"
          >
            + Add Medicine
          </button>
        </div>
      </div>

      {/* Manual Add Form */}
      {showAddModal && (
        <form
          onSubmit={handleManualAdd}
          className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm mb-6 space-y-4"
        >
          <h2 className="text-sm font-bold text-gray-800">Add Medicine to History</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Brand Name (e.g., Dolo 650)"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
            />
            <input
              type="text"
              placeholder="Active Salt(s) (e.g., Paracetamol)"
              value={saltName}
              onChange={(e) => setSaltName(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
            />
            <input
              type="text"
              placeholder="Strength (e.g., 650mg)"
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
            />
            <input
              type="text"
              placeholder="Reminder / Note (e.g., Daily at 9:00 AM)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 text-sm font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
            >
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* Dynamic Duplicate Active Ingredient Warning */}
      {duplicateSalts.length > 0 && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-900">
          <div className="font-bold text-sm flex items-center gap-2 text-red-700">
            <span>!</span> Duplicate Active Ingredient Warning Detected
          </div>
          {duplicateSalts.map((dup) => (
            <p key={dup.salt} className="text-xs text-red-800 mt-1">
              You have multiple recorded medications containing <strong>{dup.salt}</strong> ({dup.brands.join(', ')}). Taking these together may exceed safe daily limits. Consult your physician.
            </p>
          ))}
        </div>
      )}

      {/* History List */}
      {loading ? (
        <div className="p-10 text-center text-sm text-gray-500">Loading medication history...</div>
      ) : history.length === 0 ? (
        <div className="p-10 rounded-xl border border-gray-200 bg-white text-center text-sm text-gray-500">
          No medication history recorded yet. Search a medicine in <strong>Medicine Checker</strong>, scan a prescription, or click <strong>+ Add Medicine</strong>.
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
                          Duplicate Salt
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Recorded
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete record"
                        className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 mt-3">
                    <span className="font-semibold">Active Salt:</span>{' '}
                    {item.active_ingredients.length > 0
                      ? item.active_ingredients.join(', ')
                      : item.generic_name || 'N/A'}
                  </p>

                  {item.notes && (
                    <p className="text-xs text-gray-500 mt-1">Note: {item.notes}</p>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                  Recorded on {formatDate(item.recorded_at)}
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