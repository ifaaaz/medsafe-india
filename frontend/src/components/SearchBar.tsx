import React, { useState } from 'react';

interface SearchBarProps {
  onSearchResult?: (data: any) => void;
}

const BRAND_SALT_FALLBACK: Record<string, string[]> = {
  warf: ['Warfarin'],
  warfarin: ['Warfarin'],
  ecosprin: ['Aspirin'],
  aspirin: ['Aspirin'],
  combiflam: ['Ibuprofen', 'Paracetamol'],
  forcan: ['Fluconazole'],
  fluconazole: ['Fluconazole'],
  flagyl: ['Metronidazole'],
  metronidazole: ['Metronidazole'],
  telma: ['Telmisartan'],
  'pan-d': ['Pantoprazole', 'Domperidone'],
  dolo: ['Paracetamol'],
  augmentin: ['Amoxicillin', 'Clavulanic Acid'],
  atorva: ['Atorvastatin'],
};

export const SearchBar: React.FC<SearchBarProps> = ({ onSearchResult }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePrescriptionUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please select a prescription image or PDF first.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/prescription/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to analyze prescription.');
      }

      const data = await response.json();

      // Merge any OCR candidates that the backend catalog filter skipped
      const existingMeds: any[] = Array.isArray(data.detected_medicines)
        ? [...data.detected_medicines]
        : [];
      const seenNames = new Set(
        existingMeds.map((m) =>
          (m.brand_name || m.name || m.generic_name || '').toLowerCase().trim()
        )
      );

      if (Array.isArray(data.candidates)) {
        data.candidates.forEach((cand: any) => {
          const brand = (cand.brand_name || cand.brand || '').trim();
          const key = brand.toLowerCase();
          if (!brand || key === 'sample medicine' || seenNames.has(key)) return;

          // Check partial overlap so "Warf" isn't duplicated if "Warf 5mg" is already there
          const alreadyPresent = Array.from(seenNames).some(
            (existing) => existing.includes(key) || key.includes(existing)
          );
          if (alreadyPresent) return;

          seenNames.add(key);

          // Resolve active ingredients from candidate or Indian brand map
          let ingredients: string[] = Array.isArray(cand.active_ingredients)
            ? cand.active_ingredients
            : [];

          if (ingredients.length === 0 && cand.generic_name) {
            ingredients = cand.generic_name
              .split('+')
              .map((s: string) => s.replace(/\b(sodium|hydrochloride|citrate)\b/gi, '').trim())
              .filter(Boolean);
          }

          if (ingredients.length === 0) {
            const matchedKey = Object.keys(BRAND_SALT_FALLBACK).find((k) => key.includes(k));
            if (matchedKey) ingredients = BRAND_SALT_FALLBACK[matchedKey];
          }

          existingMeds.push({
            brand_name: brand,
            generic_name: cand.generic_name || ingredients.join(' + ') || brand,
            strength: cand.strength || 'Standard',
            active_ingredients: ingredients.length > 0 ? ingredients : [brand],
          });
        });
      }

      const enrichedData = {
        ...data,
        detected_medicines: existingMeds,
      };

      if (onSearchResult) {
        onSearchResult(enrichedData);
      } else {
        console.log('Analysis Result:', enrichedData);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during prescription analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4">
      <form
        onSubmit={handlePrescriptionUpload}
        className="flex flex-col gap-3 p-4 border rounded-lg shadow-sm bg-white"
      >
        <label className="block text-sm font-medium text-gray-700">
          Upload Prescription Image or PDF
        </label>

        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer"
          >
            {loading ? 'Scanning...' : 'Scan Prescription'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-1">
            <strong>Error:</strong> {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default SearchBar;