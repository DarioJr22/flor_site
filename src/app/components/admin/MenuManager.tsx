import { useState, type FormEvent } from 'react';
import { useMenu } from '../../../hooks/useMenu';
import type { MenuItemInsert, MenuItemRow, BadgeType } from '../../../lib/database.types';
import { getPublicUrl, BUCKETS } from '../../../lib/storage';
import { ImageUploader } from './ImageUploader';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
  ImageIcon,
} from 'lucide-react';

const EMPTY_FORM: MenuItemInsert = {
  name: '',
  description: '',
  price: 0,
  category: '',
  image_path: '',
  badges: [],
  available: true,
};

const CATEGORIES = [
  'Pratos Principais',
  'Entradas',
  'Sobremesas',
  'Bebidas',
  'Porções',
];

const BADGE_OPTIONS: { value: BadgeType; label: string; color: string }[] = [
  { value: 'bestseller', label: 'Mais Pedido', color: 'bg-amber-100 text-amber-800' },
  { value: 'new', label: 'Novidade', color: 'bg-green-100 text-green-800' },
  { value: 'spicy', label: 'Picante', color: 'bg-red-100 text-red-800' },
];

export function MenuManager() {
  const { items, loading, error, create, update, remove } = useMenu();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuItemInsert>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (item: MenuItemRow) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? '',
      price: item.price,
      category: item.category,
      image_path: item.image_path ?? '',
      badges: item.badges ?? [],
      available: item.available,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingId) {
      const result = await update(editingId, form);
      if (result) {
        toast.success('Item atualizado!');
        setDialogOpen(false);
      } else {
        toast.error('Erro ao atualizar item');
      }
    } else {
      const result = await create(form);
      if (result) {
        toast.success('Item criado!');
        setDialogOpen(false);
      } else {
        toast.error('Erro ao criar item');
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    setDeletingId(id);
    const ok = await remove(id);
    if (ok) toast.success('Item excluído!');
    else toast.error('Erro ao excluir');
    setDeletingId(null);
  };

  const toggleBadge = (badge: BadgeType) => {
    const current = form.badges ?? [];
    setForm({
      ...form,
      badges: current.includes(badge)
        ? current.filter((b) => b !== badge)
        : [...current, badge],
    });
  };

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cardápio</h2>
          <p className="text-sm text-gray-500">{items.length} itens cadastrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          <Plus size={16} /> Novo Item
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Imagem</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Badges</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {item.image_path ? (
                      <img
                        src={getPublicUrl(BUCKETS.MENU_ITEMS, item.image_path)}
                        alt={item.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <ImageIcon size={16} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    R$ {Number(item.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {(item.badges ?? []).map((b) => {
                        const opt = BADGE_OPTIONS.find((o) => o.value === b);
                        return (
                          <span
                            key={b}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${opt?.color ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {opt?.label ?? b}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.available ? (
                        <>
                          <Check size={12} /> Disponível
                        </>
                      ) : (
                        <>
                          <X size={12} /> Indisponível
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-amber-50 hover:text-amber-600"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Excluir"
                      >
                        {deletingId === item.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Nenhum item cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog / Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Editar Item' : 'Novo Item'}
              </h3>
              <button
                onClick={() => setDialogOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nome *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  rows={3}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Categoria *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  >
                    <option value="">Selecione…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Imagem</label>
                <ImageUploader
                  bucket={BUCKETS.MENU_ITEMS}
                  currentImage={form.image_path || null}
                  onUploadComplete={(path) => setForm({ ...form, image_path: path })}
                  onRemove={() => setForm({ ...form, image_path: '' })}
                />
              </div>

              {/* Badges */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Badges</label>
                <div className="flex flex-wrap gap-2">
                  {BADGE_OPTIONS.map((opt) => {
                    const selected = (form.badges ?? []).includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleBadge(opt.value)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                          selected
                            ? `${opt.color} border-transparent`
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Available */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="available" className="text-sm text-gray-700">
                  Disponível no cardápio
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
