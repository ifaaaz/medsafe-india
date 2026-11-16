import React from 'react';

interface MedicineCardProps {
  brandName?: string;
  genericName?: string;
  strength?: string;
  ingredients?: any[];
  active_ingredients?: any[];
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  brandName = '',
  genericName = '',
  strength = '',
  ingredients,
  active_ingredients,
}) => {
  // Use whichever prop name is provided by backend
  const activeList = ingredients || active_ingredients || [];

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-bold text-gray-800">{brandName}</h3>
      {genericName && <p className="text-sm text-gray-600">Generic: {genericName}</p>}
      {strength && <p className="text-sm text-gray-500">Strength: {strength}</p>}

      <div className="mt-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Active Ingredients:
        </span>
        <div className="flex flex-wrap gap-1 mt-1">
          {/* SAFE OPTIONAL CHAINING ON LINE 49 */}
          {activeList?.map((ing: any, idx: number) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md font-medium"
            >
              {typeof ing === 'string' ? ing : ing.name || ing}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;