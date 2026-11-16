import React from 'react';
import { AlertTriangle, Info, AlertOctagon } from 'lucide-react';

interface WarningCardProps {
  type?: 'warning' | 'danger' | 'info';
  title: string;
  children: React.ReactNode;
}

export const WarningCard: React.FC<WarningCardProps> = ({ type = 'warning', title, children }) => {
  const config = {
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    },
    danger: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
    },
  };

  const current = config[type];

  return (
    <div className={`border rounded-xl p-4 flex space-x-3 ${current.bg}`}>
      {current.icon}
      <div className="flex-1">
        <h4 className="font-semibold text-sm mb-1">{title}</h4>
        <div className="text-sm opacity-90 leading-relaxed">{children}</div>
      </div>
    </div>
  );
};