import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, action }) => {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-slate-300 rounded-2xl bg-white">
      <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-2xl mb-4">
        <PackageOpen className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};