import React from 'react';
import { StatusBadge } from './StatusBadge';

interface InteractionCardProps {
  drugA: string;
  drugB: string;
  severity: 'danger' | 'warning' | 'safe';
  severityLabel: string;
  description: string;
  mechanism: string;
}

export const InteractionCard: React.FC<InteractionCardProps> = ({
  drugA,
  drugB,
  severity,
  severityLabel,
  description,
  mechanism,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-900">{drugA}</span>
          <span className="text-slate-400">+</span>
          <span className="font-semibold text-slate-900">{drugB}</span>
        </div>
        <StatusBadge status={severity} label={severityLabel} />
      </div>

      <p className="text-sm text-slate-700 mb-3">{description}</p>

      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
        <span className="font-semibold text-slate-700 block mb-1">Deterministic Mechanism / Evidence:</span>
        <span className="text-slate-600">{mechanism}</span>
      </div>
    </div>
  );
};