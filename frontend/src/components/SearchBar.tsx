import React, { useState } from 'react';

interface SearchBarProps {
  onSearchResult?: (data: any) => void;
}

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
    // 1. PREVENT DEFAULT FORM SUBMISSION (STOPS BLANK PAGE RELOAD)
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select a prescription image or PDF first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // 2. FETCH DIRECTLY FROM FASTAPI BACKEND
      const response = await fetch("http://localhost:8000/api/v1/prescription/upload", {
        method: "POST",
        body: formData, // Do NOT manually set Content-Type header when passing FormData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to analyze prescription.");
      }

      const data = await response.json();
      
      // 3. PASS RESULT TO PARENT STATE / DISPLAY COMPONENT
      if (onSearchResult) {
        onSearchResult(data);
      } else {
        console.log("Analysis Result:", data);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during prescription analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4">
      <form onSubmit={handlePrescriptionUpload} className="flex flex-col gap-3 p-4 border rounded-lg shadow-sm bg-white">
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
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Scanning..." : "Scan Prescription"}
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