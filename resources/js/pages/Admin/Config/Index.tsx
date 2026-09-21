import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';

interface StoreConfigData {
    id: string;
    whatsapp_phone: string;
    instagram_url: string | null;
    shipping_cost: number | string;
    free_shipping_min: number | string;
    banner_message: string | null;
    is_store_open: boolean;
}

interface AccessoryCategoryItem {
    id: string;
    slug: string;
    label: string;
    emoji: string | null;
    order: number;
    is_active: boolean;
}

interface IndexProps {
    config: StoreConfigData;
    categories: AccessoryCategoryItem[];
    genres: string[];
}

export function Index({ config, categories, genres }: IndexProps) {
    // General config form
    const configForm = useForm({
        whatsapp_phone: config.whatsapp_phone || '',
        instagram_url: config.instagram_url || '',
        shipping_cost: config.shipping_cost !== undefined ? String(config.shipping_cost) : '0',
        free_shipping_min: config.free_shipping_min !== undefined ? String(config.free_shipping_min) : '0',
        banner_message: config.banner_message || '',
        is_store_open: config.is_store_open ?? true,
    });

    // Category create state
    const [newCatLabel, setNewCatLabel] = useState('');
    const [newCatEmoji, setNewCatEmoji] = useState('');
    const [isCreatingCat, setIsCreatingCat] = useState(false);

    // Genre edit & delete modal states
    const [newGenreInput, setNewGenreInput] = useState('');
    const [editingGenre, setEditingGenre] = useState<{ oldName: string; newName: string } | null>(null);
    const [deletingGenre, setDeletingGenre] = useState<string | null>(null);
    const [isProcessingGenre, setIsProcessingGenre] = useState(false);

    const handleSaveGeneralConfig = (e: React.FormEvent) => {
        e.preventDefault();
        configForm.put('/admin/configuracion/tienda', {
            preserveScroll: true,
        });
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatLabel.trim()) return;

        setIsCreatingCat(true);
        router.post(
            '/admin/configuracion/categorias',
            {
                label: newCatLabel.trim(),
                emoji: newCatEmoji.trim() || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewCatLabel('');
                    setNewCatEmoji('');
                    setIsCreatingCat(false);
                },
                onError: () => setIsCreatingCat(false),
            },
        );
    };

    const handleDeleteCategory = (id: string) => {
        router.delete(`/admin/configuracion/categorias/${id}`, {
            preserveScroll: true,
        });
    };

    const handleAddGenre = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGenreInput.trim()) return;

        setIsProcessingGenre(true);
        router.put(
            '/admin/configuracion/generos',
            {
                old_name: newGenreInput.trim(),
                new_name: newGenreInput.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewGenreInput('');
                    setIsProcessingGenre(false);
                },
                onError: () => setIsProcessingGenre(false),
            },
        );
    };

    const handleSaveEditedGenre = () => {
        if (!editingGenre || !editingGenre.newName.trim()) return;

        setIsProcessingGenre(true);
        router.put(
            '/admin/configuracion/generos',
            {
                old_name: editingGenre.oldName,
                new_name: editingGenre.newName.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingGenre(null);
                    setIsProcessingGenre(false);
                },
                onError: () => setIsProcessingGenre(false),
            },
        );
    };

    const handleDeleteGenreConfirm = () => {
        if (!deletingGenre) return;

        setIsProcessingGenre(true);
        router.delete('/admin/configuracion/generos', {
            data: { name: deletingGenre },
            preserveScroll: true,
            onSuccess: () => {
                setDeletingGenre(null);
                setIsProcessingGenre(false);
            },
            onError: () => setIsProcessingGenre(false),
        });
    };

    return (
        <AdminLayout
            title="Configuración de Tienda"
            subtitle="Ajustes de contacto, costos de logística y catálogo dinámico"
            breadcrumbText="Volver al Panel Central"
            breadcrumbHref="/admin"
        >
            <Head title="Configuración de Tienda - Admin" />

            <div className="space-y-8 animate-fade-in pb-12">
                {/* TARJETA 1: Configuración General y Operaciones */}
                <form
                    onSubmit={handleSaveGeneralConfig}
                    className="bg-paper-dark/30 border-paper-dark space-y-6 rounded-2xl border p-5 sm:p-7 shadow-xs"
                >
                    <div className="border-paper-dark border-b pb-3">
                        <h3 className="text-ink font-serif text-lg font-bold">
                            Operaciones & Configuración General
                        </h3>
                        <p className="text-ink-muted text-xs">
                            Redes sociales, WhatsApp de atención, logística de envíos y estado del checkout.
                        </p>
                    </div>

                    {/* Contacto y Redes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-ink text-xs font-semibold uppercase tracking-wider block mb-1">
                                WhatsApp de la Tienda *
                            </label>
                            <input
                                type="text"
                                required
                                value={configForm.data.whatsapp_phone}
                                onChange={(e) => configForm.setData('whatsapp_phone', e.target.value)}
                                placeholder="Ej: 5493875708557"
                                className="bg-paper border-paper-dark focus:border-forest text-ink w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono font-bold shadow-xs focus:ring-1 focus:ring-forest focus:outline-none"
                            />
                            {configForm.errors.whatsapp_phone && (
                                <p className="mt-1 text-xs text-red-600">{configForm.errors.whatsapp_phone}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-ink text-xs font-semibold uppercase tracking-wider block mb-1">
                                Enlace a Perfil de Instagram
                            </label>
                            <input
                                type="url"
                                value={configForm.data.instagram_url}
                                onChange={(e) => configForm.setData('instagram_url', e.target.value)}
                                placeholder="https://instagram.com/alma.lectora.al"
                                className="bg-paper border-paper-dark focus:border-forest text-ink w-full rounded-xl border px-3.5 py-2.5 text-sm shadow-xs focus:ring-1 focus:ring-forest focus:outline-none"
                            />
                            {configForm.errors.instagram_url && (
                                <p className="mt-1 text-xs text-red-600">{configForm.errors.instagram_url}</p>
                            )}
                        </div>
                    </div>

                    {/* Logística de Envíos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                            <label className="text-ink text-xs font-semibold uppercase tracking-wider block mb-1">
                                Costo Base de Envío ($ ARS) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={configForm.data.shipping_cost}
                                onChange={(e) => configForm.setData('shipping_cost', e.target.value)}
                                placeholder="0.00"
                                className="bg-paper border-paper-dark focus:border-forest text-ink w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono font-bold shadow-xs focus:ring-1 focus:ring-forest focus:outline-none"
                            />
                            {configForm.errors.shipping_cost && (
                                <p className="mt-1 text-xs text-red-600">{configForm.errors.shipping_cost}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-ink text-xs font-semibold uppercase tracking-wider block mb-1">
                                Mínimo de Compra para Envío Gratis ($ ARS) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={configForm.data.free_shipping_min}
                                onChange={(e) => configForm.setData('free_shipping_min', e.target.value)}
                                placeholder="0.00"
                                className="bg-paper border-paper-dark focus:border-forest text-ink w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono font-bold shadow-xs focus:ring-1 focus:ring-forest focus:outline-none"
                            />
                            {configForm.errors.free_shipping_min && (
                                <p className="mt-1 text-xs text-red-600">{configForm.errors.free_shipping_min}</p>
                            )}
                        </div>
                    </div>

                    {/* Marquesina y Estado Operativo */}
                    <div className="space-y-4 pt-1">
                        <div>
                            <label className="text-ink text-xs font-semibold uppercase tracking-wider block mb-1">
                                Mensaje del Banner Informativo / Marquesina
                            </label>
                            <textarea
                                rows={2}
                                value={configForm.data.banner_message}
                                onChange={(e) => configForm.setData('banner_message', e.target.value)}
                                placeholder="Ingresá un mensaje informativo para los clientes o dejalo vacío..."
                                className="bg-paper border-paper-dark focus:border-forest text-ink w-full rounded-xl border px-3.5 py-2.5 text-sm shadow-xs focus:ring-1 focus:ring-forest focus:outline-none resize-y"
                            />
                            {configForm.errors.banner_message && (
                                <p className="mt-1 text-xs text-red-600">{configForm.errors.banner_message}</p>
                            )}
                        </div>

                        <div className="bg-paper border-stone-300 flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border p-4 gap-3">
                            <div className="space-y-0.5">
                                <label
                                    htmlFor="is_store_open_switch"
                                    className="text-ink cursor-pointer text-sm font-bold select-none"
                                >
                                    ¿La tienda se encuentra abierta para compras?
                                </label>
                                <span className="text-ink-muted block text-xs leading-relaxed">
                                    Desactivar esta opción pausará temporalmente la finalización de compras.
                                </span>
                            </div>
                            <button
                                id="is_store_open_switch"
                                type="button"
                                role="switch"
                                aria-checked={configForm.data.is_store_open}
                                onClick={() => configForm.setData('is_store_open', !configForm.data.is_store_open)}
                                className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                    configForm.data.is_store_open ? 'bg-forest' : 'bg-stone-300'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        configForm.data.is_store_open ? 'translate-x-8' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={configForm.processing}
                            className="bg-forest hover:bg-forest-light text-white font-serif font-bold text-xs py-2.5 px-6 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                        >
                            {configForm.processing ? 'Guardando...' : 'Guardar Configuración General'}
                        </button>
                    </div>
                </form>

                {/* TARJETA 2: Configuración del Catálogo & Categorías */}
                <div className="bg-paper-dark/30 border-paper-dark space-y-8 rounded-2xl border p-5 sm:p-7 shadow-xs">
                    <div className="border-paper-dark border-b pb-3">
                        <h3 className="text-ink font-serif text-lg font-bold">
                            Configuración del Catálogo & Categorías
                        </h3>
                        <p className="text-ink-muted text-xs">
                            Administrá libremente las categorías de accesorios y los géneros literarios de los libros.
                        </p>
                    </div>

                    {/* SUBSECCIÓN A: Categorías de Accesorios */}
                    <div className="space-y-4">
                        <div className="border-stone-200 border-b pb-2">
                            <h4 className="text-ink font-serif text-sm font-bold">
                                Categorías de Accesorios
                            </h4>
                            <p className="text-ink-muted text-[11px]">
                                Etiquetas activas para velas, separadores, elementos 3D, etc.
                            </p>
                        </div>

                        <form
                            onSubmit={handleAddCategory}
                            className="bg-paper border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center rounded-xl border p-3 gap-2"
                        >
                            <input
                                type="text"
                                value={newCatEmoji}
                                onChange={(e) => setNewCatEmoji(e.target.value)}
                                placeholder="Emoji (ej: 🕯️)"
                                className="bg-paper-dark border-stone-300 text-ink w-full sm:w-24 rounded-lg border p-2 text-xs text-center focus:outline-none"
                            />
                            <input
                                type="text"
                                value={newCatLabel}
                                onChange={(e) => setNewCatLabel(e.target.value)}
                                placeholder="Nombre de categoría (ej: Velas Aromáticas)"
                                className="bg-paper-dark border-stone-300 text-ink flex-1 rounded-lg border p-2 text-xs font-semibold focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={isCreatingCat || !newCatLabel.trim()}
                                className="bg-forest hover:bg-forest-light text-white font-serif text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
                            >
                                {isCreatingCat ? 'Agregando...' : '+ Agregar Categoría'}
                            </button>
                        </form>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    className="bg-paper border-stone-300 text-ink flex items-center justify-between rounded-xl border p-3 text-xs font-semibold shadow-2xs"
                                >
                                    <span className="flex items-center gap-1.5 truncate pr-2">
                                        <span>{cat.emoji || '📌'}</span>
                                        <span className="truncate">{cat.label}</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="text-stone-400 hover:text-red-600 cursor-pointer rounded p-1 text-sm font-bold transition-colors"
                                        title="Eliminar categoría"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SUBSECCIÓN B: Géneros Literarios de Libros */}
                    <div className="space-y-4 pt-4 border-stone-300 border-t">
                        <div className="border-stone-200 border-b pb-2">
                            <h4 className="text-ink font-serif text-sm font-bold">
                                Géneros Literarios de Libros
                            </h4>
                            <p className="text-ink-muted text-[11px]">
                                Podés editar, renombrar o corregir cualquier género. El cambio se aplicará automáticamente a todos los libros asociados.
                            </p>
                        </div>

                        <form
                            onSubmit={handleAddGenre}
                            className="bg-paper border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center rounded-xl border p-3 gap-2"
                        >
                            <input
                                type="text"
                                value={newGenreInput}
                                onChange={(e) => setNewGenreInput(e.target.value)}
                                placeholder="Nombre de nuevo género (ej: Realismo Mágico)"
                                className="bg-paper-dark border-stone-300 text-ink flex-1 rounded-lg border p-2 text-xs font-semibold focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={isProcessingGenre || !newGenreInput.trim()}
                                className="bg-forest hover:bg-forest-light text-white font-serif text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
                            >
                                {isProcessingGenre ? 'Guardando...' : '+ Agregar Género'}
                            </button>
                        </form>

                        <div className="flex flex-wrap gap-2 pt-1">
                            {genres.length === 0 ? (
                                <p className="text-ink-muted text-xs italic">No hay géneros asignados en los libros aún.</p>
                            ) : (
                                genres.map((genre) => (
                                    <div
                                        key={genre}
                                        className="bg-paper border-stone-300 text-ink flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-2xs"
                                    >
                                        <span>📚 {genre}</span>
                                        <div className="flex items-center gap-1 border-stone-200 border-l pl-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setEditingGenre({ oldName: genre, newName: genre })}
                                                className="text-stone-400 hover:text-forest cursor-pointer p-0.5 text-xs"
                                                title="Renombrar género en los libros"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeletingGenre(genre)}
                                                className="text-stone-400 hover:text-red-600 cursor-pointer p-0.5 text-xs"
                                                title="Eliminar género de los libros"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Genre Modal */}
            {editingGenre && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-paper border-paper-dark w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-2xl">
                        <h3 className="text-ink font-serif text-lg font-bold">Renombrar Género</h3>
                        <p className="text-ink-muted text-xs">
                            Se modificará el género de todos los libros que tengan asignado "{editingGenre.oldName}".
                        </p>
                        <input
                            type="text"
                            value={editingGenre.newName}
                            onChange={(e) => setEditingGenre({ ...editingGenre, newName: e.target.value })}
                            className="bg-paper-dark border-paper-dark focus:border-forest text-ink w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditingGenre(null)}
                                disabled={isProcessingGenre}
                                className="border-stone-300 text-ink hover:bg-paper-dark rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveEditedGenre}
                                disabled={isProcessingGenre || !editingGenre.newName.trim()}
                                className="bg-forest hover:bg-forest-light rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                            >
                                {isProcessingGenre ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Genre Modal */}
            {deletingGenre && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-paper border-paper-dark w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-2xl">
                        <h3 className="text-ink font-serif text-lg font-bold">¿Desvincular Género?</h3>
                        <p className="text-ink-muted text-xs">
                            Se quitará el género "{deletingGenre}" de todos los libros asociados (quedarán sin género asignado).
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingGenre(null)}
                                disabled={isProcessingGenre}
                                className="border-stone-300 text-ink hover:bg-paper-dark rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteGenreConfirm}
                                disabled={isProcessingGenre}
                                className="bg-red-600 hover:bg-red-700 rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                            >
                                {isProcessingGenre ? 'Desvinculando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default Index;
