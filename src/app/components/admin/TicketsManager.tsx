// ============================================================
// TicketsManager — Componente raiz do módulo de tickets empresariais
// Gerencia as abas: Empresas, Importação, Histórico
// ============================================================

import { useState } from 'react';
import { Building2, ClipboardPaste, BarChart3 } from 'lucide-react';
import { EmpresasTab } from './tickets/EmpresasTab';
import { ImportacaoTab } from './tickets/ImportacaoTab';
import { HistoricoTab } from './tickets/HistoricoTab';

const subTabs = [
  { id: 'empresas',    label: 'Empresas',   icon: Building2 },
  { id: 'importacao',  label: 'Importação', icon: ClipboardPaste },
  { id: 'historico',   label: 'Histórico',  icon: BarChart3 },
] as const;

type SubTabId = (typeof subTabs)[number]['id'];

export function TicketsManager() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>('importacao');

  return (
    <div>
      {/* Título */}
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          🎫 Gestão de Tickets Empresariais
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Importe relatórios, gerencie empresas e imprima etiquetas para marmitas
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="mb-6 flex overflow-x-auto border-b border-gray-200">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo — renderiza tudo mas esconde abas inativas para preservar estado */}
      <div style={{ display: activeSubTab === 'empresas' ? undefined : 'none' }}>
        <EmpresasTab />
      </div>
      <div style={{ display: activeSubTab === 'importacao' ? undefined : 'none' }}>
        <ImportacaoTab />
      </div>
      <div style={{ display: activeSubTab === 'historico' ? undefined : 'none' }}>
        <HistoricoTab />
      </div>
    </div>
  );
}
