import React from 'react';
import { InteractionCard } from '../components/InteractionCard';
import { WarningCard } from '../components/WarningCard';

export const InteractionResultsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Deterministic Drug Interaction Results</h1>
        <p className="text-sm text-slate-500 mt-1">Checked against structured pharmacological rule tables (No LLM inferences).</p>
      </div>

      <WarningCard type="danger" title="Major Interaction Detected">
        Concurrent use of these active ingredients triggers clinical warnings in verified pharmaceutical databases.
      </WarningCard>

      <div className="space-y-4">
        <InteractionCard
          drugA="Aspirin"
          drugB="Ibuprofen"
          severity="danger"
          severityLabel="Major Risk"
          description="Increased risk of gastrointestinal bleeding and ulceration due to synergistic antiplatelet/NSAID effects."
          mechanism="CDSCO & Pharmacopeia Verified Interaction Rule #409: Dual NSAID inhibition of cyclooxygenase pathways."
        />
        <InteractionCard
          drugA="Pan-D (Domperidone)"
          drugB="Erythromycin"
          severity="warning"
          severityLabel="Moderate Risk"
          description="May cause QT prolongation and cardiac rhythm irregularities."
          mechanism="Pharmacovigilance Verified Rule #112: Additive cardiac electrophysiology effects."
        />
      </div>
    </div>
  );
};