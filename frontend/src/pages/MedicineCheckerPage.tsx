import React, { useState } from 'react';

interface MedicineLookupResult {
  brand_name: string;
  generic_name: string;
  strength: string;
  dosage_form: string;
  active_ingredients: string[];
  therapeutic_uses: string;
  source: string;
}

export const MedicineCheckerPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MedicineLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent, overrideQuery?: string) => {
    e.preventDefault();
    const searchText = (overrideQuery ?? query).trim();
    if (!searchText) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/medicines/lookup?q=${encodeURIComponent(searchText)}`
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Could not retrieve medicine details.');
      }
      const data: MedicineLookupResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const quickExamples = ['Dolo 650', 'Augmentin 625', 'Pan-D', 'Ecosprin 75'];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medicine &amp; Brand Checker</h1>
        <p className="text-sm text-gray-600 mt-1">
          Search any Indian medicine brand or generic salt to view its therapeutic uses, active ingredients, and safety details.
        </p>
      </div>

      {/* Text Search Box */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6"
      >
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search Medicine Brand or Generic Name
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Dolo 650, Augmentin 625, Telma 40, Azithral 500..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Searching...' : 'Check Uses'}
          </button>
        </div>

        {/* Quick Click Suggestions */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-gray-500">Try:</span>
          {quickExamples.map((med) => (
            <button
              key={med}
              type="button"
              onClick={(e) => {
                setQuery(med);
                handleSearch(e, med);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            >
              {med}
            </button>
          ))}
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Empty State Placeholder */}
      {!result && !loading && !error && (
        <div className="p-10 rounded-xl border border-gray-200 bg-white text-center text-sm text-gray-500">
          Enter a medicine brand name above to view its clinical uses and active composition.
        </div>
      )}

      {/* Medicine Uses & Details Card */}
      {result && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-wrap justify-between items-start gap-3 bg-emerald-50/40">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-gray-900">{result.brand_name}</h2>
                {result.strength && (
                  <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md border border-gray-200">
                    {result.strength} • {result.dosage_form}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Generic Composition: <span className="font-medium text-gray-800">{result.generic_name}</span>
              </p>
            </div>

            <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {result.source}
            </span>
          </div>

          <div className="p-5 space-y-5">
            {/* Therapeutic Uses Section */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                Primary Uses &amp; Clinical Indications
              </h3>
              <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                {result.therapeutic_uses}
              </p>
            </div>

            {/* Active Ingredients */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Active Chemical Ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.active_ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-200"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineCheckerPage;