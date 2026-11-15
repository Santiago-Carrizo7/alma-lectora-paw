import React, { useRef, useState } from 'react';

interface ImageGalleryUploadProps {
    coverUrl: string | null;
    additionalImages?: string[];
    onCoverChange: (url: string) => void;
    onAdditionalImagesChange: (images: string[]) => void;
    disabled?: boolean;
}

export function ImageGalleryUpload({
    coverUrl,
    additionalImages = [],
    onCoverChange,
    onAdditionalImagesChange,
    disabled = false,
}: ImageGalleryUploadProps) {
    const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
    const [urlInputSlot, setUrlInputSlot] = useState<number | null>(null);
    const [tempUrl, setTempUrl] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const sessionUploadsRef = useRef<Set<string>>(new Set());

    const fileInputRef0 = useRef<HTMLInputElement>(null);
    const fileInputRef1 = useRef<HTMLInputElement>(null);
    const fileInputRef2 = useRef<HTMLInputElement>(null);

    const fileRefs = [fileInputRef0, fileInputRef1, fileInputRef2];

    const slots = [
        { label: 'Portada Principal', isCover: true, value: coverUrl || '' },
        { label: 'Foto Extra 1', isCover: false, value: additionalImages[0] || '' },
        { label: 'Foto Extra 2', isCover: false, value: additionalImages[1] || '' },
    ];

    const getCsrfToken = () => {
        return (
            document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ||
            (document.cookie.match(/XSRF-TOKEN=([^;]+)/) ? decodeURIComponent(RegExp.$1) : '')
        );
    };

    const deleteSessionUploadIfApplicable = async (urlToRemove: string) => {
        if (!urlToRemove || !sessionUploadsRef.current.has(urlToRemove)) {
            return;
        }
        sessionUploadsRef.current.delete(urlToRemove);

        try {
            const token = getCsrfToken();
            await fetch('/admin/upload-image', {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ url: urlToRemove }),
            });
        } catch {
            // Non-blocking cleanup for temporary session uploads
        }
    };

    const handleUploadFile = async (file: File, slotIndex: number) => {
        setErrorMessage(null);

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (file.type && !allowedTypes.includes(file.type)) {
            setErrorMessage('Formato no soportado. Usá JPG, PNG, WEBP o GIF.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('La imagen supera el tamaño máximo permitido de 5 MB.');
            return;
        }

        setUploadingSlot(slotIndex);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const token = getCsrfToken();
            if (token) {
                formData.append('_token', token);
            }

            const response = await fetch('/admin/upload-image', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                const firstError = errData?.errors?.image?.[0];
                throw new Error(firstError || errData?.message || 'Error al subir la imagen.');
            }

            const data = await response.json();
            const uploadedUrl = data.url;
            const previousUrl = slots[slotIndex]?.value || '';

            if (uploadedUrl) {
                sessionUploadsRef.current.add(uploadedUrl);
            }
            if (previousUrl && previousUrl !== uploadedUrl) {
                void deleteSessionUploadIfApplicable(previousUrl);
            }

            applyImageUrl(slotIndex, uploadedUrl);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Error desconocido al subir archivo.';
            setErrorMessage(msg);
        } finally {
            setUploadingSlot(null);
        }
    };

    const buildExtraSlots = (): [string, string] => [
        additionalImages[0] || '',
        additionalImages[1] || '',
    ];

    const applyImageUrl = (slotIndex: number, url: string) => {
        const trimmed = url.trim();
        if (slotIndex === 0) {
            onCoverChange(trimmed);
        } else {
            const next = buildExtraSlots();
            next[slotIndex - 1] = trimmed;
            onAdditionalImagesChange(next);
        }
    };

    const handleRemove = (slotIndex: number) => {
        const currentUrl = slots[slotIndex]?.value || '';
        if (currentUrl) {
            void deleteSessionUploadIfApplicable(currentUrl);
        }

        if (slotIndex === 0) {
            onCoverChange('');
        } else {
            const next = buildExtraSlots();
            next[slotIndex - 1] = '';
            onAdditionalImagesChange(next);
        }
    };

    const handleConfirmUrl = (slotIndex: number) => {
        if (tempUrl.trim()) {
            applyImageUrl(slotIndex, tempUrl.trim());
        }
        setUrlInputSlot(null);
        setTempUrl('');
    };

    return (
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-paper-dark/20 p-5">
            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                <div>
                    <label className="text-xs font-bold tracking-wider text-ink-muted uppercase">
                        Fotografías del Producto (Hasta 3 fotos)
                    </label>
                    <p className="text-[11px] text-stone-500">
                        Sube archivos desde tu equipo o vincula URLs directas. La primera foto actúa como portada principal.
                    </p>
                </div>
            </div>

            {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
                    {errorMessage}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {slots.map((slot, index) => {
                    const hasImage = Boolean(slot.value);
                    const isUploading = uploadingSlot === index;
                    const isEditingUrl = urlInputSlot === index;

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center rounded-xl border border-stone-200 bg-paper p-3 shadow-2xs"
                        >
                            <span className="mb-2 text-[10px] font-bold tracking-wider text-forest uppercase">
                                {slot.label} {index === 0 && <span className="text-red-500">*</span>}
                            </span>

                            {/* Image Preview / Drop Zone */}
                            <div className="group relative flex aspect-3/4 w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-stone-300 bg-stone-50">
                                {hasImage ? (
                                    <>
                                        <img
                                            src={slot.value}
                                            alt={slot.label}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    'https://placehold.co/400x550/e2e8f0/64748b?text=Error+de+Carga';
                                            }}
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() => fileRefs[index].current?.click()}
                                                disabled={disabled || isUploading}
                                                className="cursor-pointer rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-stone-800 shadow-xs hover:bg-white"
                                            >
                                                Subir archivo
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTempUrl(slot.value);
                                                    setUrlInputSlot(index);
                                                }}
                                                disabled={disabled || isUploading}
                                                className="cursor-pointer rounded-md bg-stone-800/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-stone-900"
                                            >
                                                Editar URL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(index)}
                                                disabled={disabled || isUploading}
                                                className="cursor-pointer rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-red-700"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-3 text-center">
                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-forest border-t-transparent"></div>
                                                <span className="text-[10px] font-medium text-forest">Subiendo...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <svg
                                                    className="mb-1 h-8 w-8 text-stone-300"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <span className="text-[11px] font-medium text-stone-500">
                                                    Sin imagen
                                                </span>
                                                <div className="mt-2 flex flex-col gap-1 w-full">
                                                    <button
                                                        type="button"
                                                        onClick={() => fileRefs[index].current?.click()}
                                                        disabled={disabled}
                                                        className="cursor-pointer rounded-lg border border-stone-300 bg-white px-2 py-1 text-[10px] font-semibold text-stone-700 hover:bg-stone-100"
                                                    >
                                                        Subir archivo
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setTempUrl('');
                                                            setUrlInputSlot(index);
                                                        }}
                                                        disabled={disabled}
                                                        className="cursor-pointer text-[10px] text-stone-400 underline hover:text-stone-600"
                                                    >
                                                        o pegar URL
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileRefs[index]}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleUploadFile(file, index);
                                    }
                                    e.target.value = '';
                                }}
                            />

                            {/* Optional URL input toggle */}
                            {isEditingUrl && (
                                <div className="mt-2 flex w-full flex-col gap-1">
                                    <input
                                        type="text"
                                        value={tempUrl}
                                        onChange={(e) => setTempUrl(e.target.value)}
                                        placeholder="https://... o /storage/uploads/..."
                                        className="w-full rounded border border-stone-300 px-2 py-1 font-mono text-[10px] focus:border-forest focus:outline-none"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleConfirmUrl(index);
                                            }
                                        }}
                                    />
                                    <div className="flex justify-end gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setUrlInputSlot(null)}
                                            className="cursor-pointer text-[10px] text-stone-400 hover:text-stone-600"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleConfirmUrl(index)}
                                            className="cursor-pointer rounded bg-forest px-2 py-0.5 text-[10px] font-bold text-white hover:bg-forest-light"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ImageGalleryUpload;
