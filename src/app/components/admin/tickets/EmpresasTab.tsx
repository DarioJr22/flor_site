// ============================================================
// EmpresasTab — Aba de cadastro e gerenciamento de empresas
// ============================================================

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Search, Building2 } from 'lucide-react';
import { useEmpresas } from '../../../../hooks/useEmpresas';
import { EmpresaFormDialog } from './EmpresaFormDialog';
import type { EmpresaClienteRow, EmpresaClienteInsert } from '../../../../lib/database.types';

const STATUS_BADGE: Record<string, string> = {
  ativo: 'bg-green-100 text-green-700',
  inativo: 'bg-gray-100 text-gray-500',
  suspenso: 'bg-red-100 text-red-600',
};

const DIAS_LABEL: Record<string, string> = {
  seg: 'S',
  ter: 'T',
  qua: 'Q',
  qui: 'Q',
  sex: 'S',
  sab: 'S',
  dom: 'D',
};

export function EmpresasTab() {
  const { empresas, loading, error, create, update, remove } = useEmpresas();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<EmpresaClienteRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtradas = empresas.filter(
    e =>
      e.nome.toLowerCase().includes(search.toLowerCase()) ||
      (e.cnpj ?? '').includes(search)
  );

  const openCreate = () => {
    setEditingEmpresa(null);
    setDialogOpen(true);
  };

  const openEdit = (empresa: EmpresaClienteRow) => {
    setEditingEmpresa(empresa);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: EmpresaClienteInsert) => {
    if (editingEmpresa) {
      const result = await update(editingEmpresa.id, data);
      if (result) {
        toast.success('Empresa atualizada!');
        setDialogOpen(false);
      } else {
        toast.error('Erro ao atualizar empresa');
      }
    } else {
      const result = await create(data);
      if (result) {
        toast.success('Empresa cadastrada!');
        setDialogOpen(false);
      } else {
        toast.error('Erro ao cadastrar empresa');
      }
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir a empresa "${nome}"? Todos os tickets vinculados serão removidos.`)) return;
    setDeletingId(id);
    const ok = await remove(id);
    if (ok) toast.success('Empresa excluída!');
    else toast.error('Erro ao excluir empresa');
    setDeletingId(null);
  };

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Empresas Clientes</h3>
          <p className="text-sm text-gray-500">{empresas.length} empresas cadastradas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empresa…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-56 rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            <Plus size={16} /> Nova Empresa
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Building2 size={40} className="mb-3" />
          <p className="text-sm">Nenhuma empresa cadastrada</p>
          <button onClick={openCreate} className="mt-3 text-sm font-medium text-amber-600 hover:underline">
            Cadastrar primeira empresa
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">CNPJ</th>
                  <th className="px-4 py-3">Dias</th>
                  <th className="px-4 py-3">Horário</th>
                  <th className="px-4 py-3">Valor Ticket</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtradas.map(empresa => (
                  <tr key={empresa.id} className="transition hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{empresa.nome}</p>
                        {empresa.contato_nome && (
                          <p className="text-xs text-gray-500">{empresa.contato_nome}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {empresa.cnpj || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {(['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] as const).map(dia => {
                          const ativo = (empresa.dias_fornecimento ?? []).includes(dia);
                          return (
                            <span
                              key={dia}
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                ativo ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-300'
                              }`}
                            >
                              {DIAS_LABEL[dia]}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {empresa.horario_entrega?.slice(0, 5) ?? '12:00'}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatarMoeda(empresa.valor_ticket)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          STATUS_BADGE[empresa.status] ?? STATUS_BADGE.inativo
                        }`}
                      >
                        {empresa.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(empresa)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(empresa.id, empresa.nome)}
                          disabled={deletingId === empresa.id}
                          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Excluir"
                        >
                          {deletingId === empresa.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EmpresaFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        editingData={editingEmpresa}
      />
    </div>
  );
}
