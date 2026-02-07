import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, Loader2, ImageIcon, AlertCircle } from 'lucide-react';
import {
  uploadImage,
  replaceImage,
  deleteImage,
  getPublicUrl,
  validateImageFile,
  type BucketName,
} from '../../../lib/storage';

interface ImageUploaderProps {
  /** Supabase Storage bucket name */
  bucket: BucketName;
  /** Optional subfolder inside the bucket */
  folder?: string;
  /** Current image path stored in the database (not a full URL) */
  currentImage?: string | null;
  /** Called with the new storage path after a successful upload */
  onUploadComplete: (path: string) => void;
  /** Called when the image is removed */
  onRemove?: () => void;
  /** Extra CSS class names for the wrapper */
  className?: string;
}

export function ImageUploader({
  bucket,
  folder = '',
  currentImage,
  onUploadComplete,
  onRemove,
  className = '',
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Resolve the display URL: preview > currentImage (storage path or full URL)
  const displayUrl =
    preview ??
    (currentImage
      ? currentImage.startsWith('http')
        ? currentImage
        : getPublicUrl(bucket, currentImage)
      : null);

  // ---- Core upload logic ----
  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Instant local preview
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      setUploading(true);

      try {
        const result = currentImage
          ? await replaceImage(file, bucket, currentImage, folder)
          : await uploadImage(file, bucket, folder);

        onUploadComplete(result.path);
        // Replace local blob with real public URL
        setPreview(result.publicUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro no upload');
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [bucket, folder, currentImage, onUploadComplete],
  );

  // ---- Event handlers ----
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = async () => {
    if (currentImage) {
      try {
        await deleteImage(bucket, currentImage);
      } catch {
        /* ignore – may already be deleted */
      }
    }
    setPreview(null);
    setError(null);
    onRemove?.();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {displayUrl ? (
        /* ---------- Image preview ---------- */
        <div className="group relative overflow-hidden rounded-xl border border-gray-200">
          <img
            src={displayUrl}
            alt="Preview"
            className="h-48 w-full object-cover"
          />

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm font-medium">Enviando…</span>
              </div>
            </div>
          )}

          {!uploading && (
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-800 shadow hover:bg-white"
              >
                Trocar
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-red-600"
              >
                Remover
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ---------- Drop zone ---------- */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors ${
            dragOver
              ? 'border-amber-500 bg-amber-50'
              : 'border-gray-300 bg-gray-50 hover:border-amber-400 hover:bg-amber-50/50'
          }`}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                {dragOver ? (
                  <ImageIcon className="h-6 w-6 text-amber-600" />
                ) : (
                  <Upload className="h-6 w-6 text-amber-600" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {dragOver ? 'Solte a imagem aqui' : 'Clique ou arraste uma imagem'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  JPEG, PNG, WebP ou GIF — máx 5 MB
                </p>
              </div>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
