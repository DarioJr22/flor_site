import { useState, type FormEvent } from 'react';
import { usePromoBanners } from '../../../hooks/usePromoBanners';
import type { PromoBannerInsert, PromoBannerRow } from '../../../lib/database.types';
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

const EMPTY_FORM: PromoBannerInsert = {
  title: '',
  description: '',
  image_path: '',
  active: true,
  valid_until: '',
};

export function PromoBannersManager() {
  const { banners, loading, error, create, update, remove } = usePromoBanners();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromoBannerInsert>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (banner: PromoBannerRow) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      description: banner.description ?? '',
      image_path: banner.image_path ?? '',
      active: banner.active,
      valid_until: banner.valid_until ? banner.valid_until.split('T')[0] : '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      valid_until: form.valid_until || null,
    };

    if (editingId) {
      const result = await update(editingId, payload);
      if (result) { toast.success('Banner atualizado!'); setDialogOpen(false); }
      else toast.error('Erro ao atualizar');
    } else {
      const result = await create(payload);
      if (result) { toast.success('Banner criado!'); setDialogOpen(false); }
      else toast.error('Erro ao criar');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este banner?')) return;
    setDeletingId(id);
    const ok = await remove(id);
    if (ok) toast.success('Banner excluído!');
    else toast.error('Erro ao excluir');
    setDeletingId(null);
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
          <h2 className="text-xl font-bold text-gray-900">Promoções</h2>
          <p className="text-sm text-gray-500">{banners.length} banners</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          <Plus size={16} /> Novo Banner
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            {banner.image_path ? (
              <img
                src={getPublicUrl(BUCKETS.PROMO_BANNERS, banner.image_path)}
                alt={banner.title}
                className="h-36 w-full object-cover"
              />
            ) : (
              <div className="flex h-36 items-center justify-center bg-gray-100">
                <ImageIcon size={32} className="text-gray-300" />
              </div>
            )}
            <div className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                <span
                  className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    banner.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {banner.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              {banner.description && (
                <p className="mb-2 text-sm text-gray-600 line-clamp-2">
                  {banner.description}
                </p>
              )}
              {banner.valid_until && (
                <p className="mb-3 text-xs text-gray-400">
                  Válido até: {new Date(banner.valid_until).toLocaleDateString('pt-BR')}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(banner)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Pencil size={13} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  disabled={deletingId === banner.id}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === banner.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400">
            Nenhum banner cadastrado
          </div>
        )}
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Editar Banner' : 'Novo Banner'}
              </h3>
              <button
                onClick={() => setDialogOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Título *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  rows={3}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Imagem</label>
                <ImageUploader
                  bucket={BUCKETS.PROMO_BANNERS}
                  currentImage={form.image_path || null}
                  onUploadComplete={(path) => setForm({ ...form, image_path: path })}
                  onRemove={() => setForm({ ...form, image_path: '' })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Válido até</label>
                <input
                  type="date"
                  value={(form.valid_until as string) ?? ''}
                  onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="banner-active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="banner-active" className="text-sm text-gray-700">
                  Banner ativo
                </label>
              </div>

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
