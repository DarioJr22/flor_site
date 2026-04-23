// ============================================================
// EmpresaFormDialog — Modal de cadastro/edição de empresa
// ============================================================

import { useState, type FormEvent } from 'react';
import { X, Loader2, Building2 } from 'lucide-react';
import type { EmpresaClienteInsert, EmpresaClienteRow, DiaSemana, EmpresaStatus } from '../../../../lib/database.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EmpresaClienteInsert) => Promise<unknown>;
  editingData?: EmpresaClienteRow | null;
}

const DIAS_SEMANA: { value: DiaSemana; label: string }[] = [
  { value: 'seg', label: 'Seg' },
  { value: 'ter', label: 'Ter' },
  { value: 'qua', label: 'Qua' },
  { value: 'qui', label: 'Qui' },
  { value: 'sex', label: 'Sex' },
  { value: 'sab', label: 'Sáb' },
  { value: 'dom', label: 'Dom' },
];

const STATUS_OPTIONS: { value: EmpresaStatus; label: string; color: string }[] = [
  { value: 'ativo', label: 'Ativo', color: 'text-green-600' },
  { value: 'inativo', label: 'Inativo', color: 'text-gray-500' },
  { value: 'suspenso', label: 'Suspenso', color: 'text-red-500' },
];

const EMPTY_FORM: EmpresaClienteInsert = {
  nome: '',
  cnpj: '',
  contato_nome: '',
  contato_telefone: '',
  contato_email: '',
  endereco_entrega: '',
  dias_fornecimento: ['seg', 'ter', 'qua', 'qui', 'sex'],
  horario_entrega: '12:00',
  valor_ticket: 25.0,
  status: 'ativo',
  data_inicio_contrato: '',
  observacoes: '',
};

/**
 * Formata CNPJ: XX.XXX.XXX/XXXX-XX
 */
function formatarCNPJ(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatarTelefone(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function EmpresaFormDialog({ open, onClose, onSubmit, editingData }: Props) {
  const [form, setForm] = useState<EmpresaClienteInsert>(() =>
    editingData
      ? {
          nome: editingData.nome,
          cnpj: editingData.cnpj ?? '',
          contato_nome: editingData.contato_nome ?? '',
          contato_telefone: editingData.contato_telefone ?? '',
          contato_email: editingData.contato_email ?? '',
          endereco_entrega: editingData.endereco_entrega ?? '',
          dias_fornecimento: editingData.dias_fornecimento ?? ['seg', 'ter', 'qua', 'qui', 'sex'],
          horario_entrega: editingData.horario_entrega ?? '12:00',
          valor_ticket: editingData.valor_ticket ?? 25.0,
          status: editingData.status ?? 'ativo',
          data_inicio_contrato: editingData.data_inicio_contrato ?? '',
          observacoes: editingData.observacoes ?? '',
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const isEditing = !!editingData;
  const titulo = isEditing ? 'Editar Empresa' : 'Nova Empresa';

  const toggleDia = (dia: DiaSemana) => {
    const dias = form.dias_fornecimento ?? [];
    setForm(prev => ({
      ...prev,
      dias_fornecimento: dias.includes(dia)
        ? dias.filter(d => d !== dia)
        : [...dias, dia],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit({
      ...form,
      cnpj: form.cnpj || null,
      contato_nome: form.contato_nome || null,
      contato_telefone: form.contato_telefone || null,
      contato_email: form.contato_email || null,
      endereco_entrega: form.endereco_entrega || null,
      data_inicio_contrato: form.data_inicio_contrato || null,
      observacoes: form.observacoes || null,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {/* Cabeçalho */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">{titulo}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nome da Empresa <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.nome}
              onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              placeholder="Ex: Saraiva Ltda"
            />
          </div>

          {/* CNPJ */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">CNPJ</label>
            <input
              value={form.cnpj ?? ''}
              onChange={e => setForm(prev => ({ ...prev, cnpj: formatarCNPJ(e.target.value) }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              placeholder="XX.XXX.XXX/XXXX-XX"
            />
          </div>

          {/* Contato */}
          <fieldset className="rounded-lg border border-gray-200 p-3">
            <legend className="px-1 text-xs font-semibold text-gray-500 uppercase">Contato</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Nome</label>
                <input
                  value={form.contato_nome ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, contato_nome: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Telefone</label>
                <input
                  value={form.contato_telefone ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, contato_telefone: formatarTelefone(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-amber-500"
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Email</label>
                <input
                  type="email"
                  value={form.contato_email ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, contato_email: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </fieldset>

          {/* Endereço */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Endereço de Entrega</label>
            <textarea
              value={form.endereco_entrega ?? ''}
              onChange={e => setForm(prev => ({ ...prev, endereco_entrega: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Dias de fornecimento */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Dias de Fornecimento</label>
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map(dia => {
                const selecionado = (form.dias_fornecimento ?? []).includes(dia.value);
                return (
                  <button
                    key={dia.value}
                    type="button"
                    onClick={() => toggleDia(dia.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      selecionado
                        ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {dia.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horário + Valor + Status */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Horário de Entrega</label>
              <input
                type="time"
                value={form.horario_entrega ?? '12:00'}
                onChange={e => setForm(prev => ({ ...prev, horario_entrega: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Valor do Ticket (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.valor_ticket ?? 25}
                onChange={e => setForm(prev => ({ ...prev, valor_ticket: parseFloat(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status ?? 'ativo'}
                onChange={e => setForm(prev => ({ ...prev, status: e.target.value as EmpresaStatus }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data início contrato */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Data Início Contrato</label>
            <input
              type="date"
              value={form.data_inicio_contrato ?? ''}
              onChange={e => setForm(prev => ({ ...prev, data_inicio_contrato: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              value={form.observacoes ?? ''}
              onChange={e => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !form.nome.trim()}
              className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEditing ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
