import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';
import { formatPrice } from '../../../lib/price';

interface AvailableItem {
    id: string;
    title: string;
    price: number | string;
    cover_url: string | null;
}

interface LinkedItem {
    id: string;
    quantity: number;
    book_id?: string;
    accessory_id?: string;
    book?: { id: string; title: string; price?: number | string };
    accessory?: { id: string; title: string; price?: number | string };
}

interface ComboItem {
    id: string;
    title: string;
    description: string | null;
    price: number | string;
    promo_quantity: number | null;
    promo_price: number | string | null;
    stock: number;
    cover_url: string | null;
    is_active: boolean;
    books?: LinkedItem[];
    accessories?: LinkedItem[];
}

interface FormProps {
    combo?: ComboItem;
    availableBooks: AvailableItem[];
    availableAccessories: AvailableItem[];
}

export function Form({ combo, availableBooks, availableAccessories }: FormProps) {
    const isEditing = Boolean(combo);

    // Parse initial selected books and accessories safely
    const initialBooks =
        combo?.books?.map((b) => ({
            id: b.book?.id || b.book_id || b.id,
            quantity: b.quantity,
        })) || [];

    const initialAccessories =
        combo?.accessories?.map((a) => ({
            id: a.accessory?.id || a.accessory_id || a.id,
            quantity: a.quantity,
        })) || [];

    const [selectedBookId, setSelectedBookId] = useState('');
    const [selectedAccId, setSelectedAccId] = useState('');

    const form = useForm({
        title: combo?.title || '',
        price: combo?.price !== undefined ? String(combo.price) : '',
        promo_quantity: combo?.promo_quantity ? String(combo.promo_quantity) : '',
        promo_price: combo?.promo_price ? String(combo.promo_price) : '',
        stock: combo?.stock !== undefined ? combo.stock : 0,
        cover_url: combo?.cover_url || '',
        description: combo?.description || '',
        is_active: combo ? combo.is_active : true,
        books: initialBooks,
        accessories: initialAccessories,
    });

    const handleAddBook = () => {
        if (!selectedBookId) return;
        if (form.data.books.some((b) => b.id === selectedBookId)) return;

        form.setData('books', [...form.data.books, { id: selectedBookId, quantity: 1 }]);
        setSelectedBookId('');
    };

    const handleRemoveBook = (id: string) => {
        form.setData(
            'books',
            form.data.books.filter((b) => b.id !== id),
        );
    };

    const handleBookQuantityChange = (id: string, quantity: number) => {
        form.setData(
            'books',
            form.data.books.map((b) => (b.id === id ? { ...b, quantity: Math.max(1, quantity) } : b)),
        );
    };

    const handleAddAccessory = () => {
        if (!selectedAccId) return;
        if (form.data.accessories.some((a) => a.id === selectedAccId)) return;

        form.setData('accessories', [...form.data.accessories, { id: selectedAccId, quantity: 1 }]);
        setSelectedAccId('');
    };

    const handleRemoveAccessory = (id: string) => {
        form.setData(
            'accessories',
            form.data.accessories.filter((a) => a.id !== id),
        );
    };

    const handleAccessoryQuantityChange = (id: string, quantity: number) => {
        form.setData(
            'accessories',
            form.data.accessories.map((a) => (a.id === id ? { ...a, quantity: Math.max(1, quantity) } : a)),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && combo) {
            form.put(`/admin/combos/${combo.id}`);
        } else {
            form.post('/admin/combos');
        }
    };

    return (
        <AdminLayout
            title={isEditing ? `Editar: ${combo?.title}` : 'Registrar Nuevo Combo'}
            subtitle={
                isEditing
                    ? 'Actualiza los datos del combo, sus productos asociados y stock disponible'
                    : 'Completa el formulario para incorporar un nuevo paquete promocional a la tienda'
            }
            breadcrumbText="Volver al Listado"
            breadcrumbHref="/admin/combos"
        >
            <Head title={isEditing ? `Editar ${combo?.title} - Admin` : 'Nuevo Combo - Admin'} />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 animate-fade-in">
                {/* Card 1: Información del Combo */}
                <div className="bg-paper border-paper-dark/80 space-y-5 rounded-2xl border p-6 shadow-xs">
                    <h3 className="text-ink border-paper-dark/60 border-b pb-3 font-serif text-base font-bold">
                        Información del Combo
                    </h3>

                    <div className="grid grid-cols-1 gap-5">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Título del Combo <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder="Ej. Pack Romance: Novela + Vela Aromática"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs placeholder:text-stone-400 focus:ring-2"
                                required
                            />
                            {form.errors.title && <p className="text-xs font-medium text-red-600">{form.errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Descripción y Contenido Detallado
                            </label>
                            <textarea
                                rows={4}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                placeholder="Detalla qué contiene el combo, experiencia lectora sugerida o beneficios de la promoción..."
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs leading-relaxed focus:ring-2"
                            />
                            {form.errors.description && <p className="text-xs font-medium text-red-600">{form.errors.description}</p>}
                        </div>
                    </div>
                </div>

                {/* Card 2: Precio e Inventario */}
                <div className="bg-paper border-paper-dark/80 space-y-5 rounded-2xl border p-6 shadow-xs">
                    <h3 className="text-ink border-paper-dark/60 border-b pb-3 font-serif text-base font-bold">
                        Precio e Inventario
                    </h3>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
                        {/* Price */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Precio Combo ($) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.price}
                                onChange={(e) => form.setData('price', e.target.value)}
                                placeholder="Ej. 18500"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-xs focus:ring-2"
                                required
                            />
                            {form.errors.price && <p className="text-xs font-medium text-red-600">{form.errors.price}</p>}
                        </div>

                        {/* Stock */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Stock (Unidades) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.data.stock}
                                onChange={(e) => form.setData('stock', parseInt(e.target.value, 10) || 0)}
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-xs focus:ring-2"
                                required
                            />
                            {form.errors.stock && <p className="text-xs font-medium text-red-600">{form.errors.stock}</p>}
                        </div>

                        {/* Promo Quantity */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Cantidad Promo (Ej: 2)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.data.promo_quantity}
                                onChange={(e) => form.setData('promo_quantity', e.target.value)}
                                placeholder="Ej. 2 para 2x1"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-xs focus:ring-2"
                            />
                        </div>

                        {/* Promo Price */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Precio Promo Total ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.promo_price}
                                onChange={(e) => form.setData('promo_price', e.target.value)}
                                placeholder="Ej. 30000"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-xs focus:ring-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Card 3: Productos Vinculados */}
                <div className="bg-paper border-paper-dark/80 space-y-6 rounded-2xl border p-6 shadow-xs">
                    <div>
                        <h3 className="text-ink border-paper-dark/60 border-b pb-3 font-serif text-base font-bold">
                            Productos Incluidos en el Combo
                        </h3>
                        <p className="text-ink-muted pt-2 text-xs">
                            Selecciona los libros y accesorios que forman parte de esta promoción.
                        </p>
                    </div>

                    {/* Section 3.1: Libros Vinculados */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Libros Incluidos
                            </label>
                            <span className="text-forest bg-forest/10 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
                                {form.data.books.length} seleccionados
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-2 sm:flex-row">
                            <select
                                value={selectedBookId}
                                onChange={(e) => setSelectedBookId(e.target.value)}
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs focus:ring-2 sm:flex-1"
                            >
                                <option value="">-- Seleccionar libro para agregar --</option>
                                {availableBooks
                                    .filter((b) => !form.data.books.some((item) => item.id === b.id))
                                    .map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.title} ({formatPrice(b.price)})
                                        </option>
                                    ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleAddBook}
                                disabled={!selectedBookId}
                                className="bg-paper-dark text-ink hover:bg-stone-300 w-full cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-40 sm:w-auto"
                            >
                                + Agregar Libro
                            </button>
                        </div>

                        {/* Books List */}
                        {form.data.books.length > 0 ? (
                            <div className="border-paper-dark divide-paper-dark overflow-hidden rounded-xl border divide-y text-xs">
                                {form.data.books.map((item) => {
                                    const bookInfo = availableBooks.find((b) => b.id === item.id);
                                    return (
                                        <div key={item.id} className="bg-paper/80 flex items-center justify-between p-3">
                                            <div className="min-w-0 pr-2">
                                                <p className="text-ink font-bold truncate">
                                                    {bookInfo?.title || 'Libro vinculado'}
                                                </p>
                                                {bookInfo && (
                                                    <p className="text-stone-400 font-mono text-[11px]">
                                                        {formatPrice(bookInfo.price)} c/u
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex shrink-0 items-center gap-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-ink-muted text-[11px] font-bold">Cant:</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            handleBookQuantityChange(item.id, parseInt(e.target.value, 10) || 1)
                                                        }
                                                        className="bg-paper border-paper-dark w-14 rounded-lg border py-1 text-center font-mono text-xs"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBook(item.id)}
                                                    className="cursor-pointer rounded-lg p-1 text-stone-400 hover:text-red-600 transition-colors"
                                                    title="Quitar del combo"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-paper-dark/20 border-paper-dark/60 rounded-xl border p-3 text-center text-xs text-stone-400 italic">
                                No se han seleccionado libros todavía.
                            </div>
                        )}
                    </div>

                    {/* Section 3.2: Accesorios Vinculados */}
                    <div className="space-y-3 pt-3">
                        <div className="flex items-center justify-between">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Accesorios Incluidos
                            </label>
                            <span className="text-purple-700 bg-purple-50 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
                                {form.data.accessories.length} seleccionados
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-2 sm:flex-row">
                            <select
                                value={selectedAccId}
                                onChange={(e) => setSelectedAccId(e.target.value)}
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs focus:ring-2 sm:flex-1"
                            >
                                <option value="">-- Seleccionar accesorio para agregar --</option>
                                {availableAccessories
                                    .filter((a) => !form.data.accessories.some((item) => item.id === a.id))
                                    .map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.title} ({formatPrice(a.price)})
                                        </option>
                                    ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleAddAccessory}
                                disabled={!selectedAccId}
                                className="bg-paper-dark text-ink hover:bg-stone-300 w-full cursor-pointer rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-40 sm:w-auto"
                            >
                                + Agregar Accesorio
                            </button>
                        </div>

                        {/* Accessories List */}
                        {form.data.accessories.length > 0 ? (
                            <div className="border-paper-dark divide-paper-dark overflow-hidden rounded-xl border divide-y text-xs">
                                {form.data.accessories.map((item) => {
                                    const accInfo = availableAccessories.find((a) => a.id === item.id);
                                    return (
                                        <div key={item.id} className="bg-paper/80 flex items-center justify-between p-3">
                                            <div className="min-w-0 pr-2">
                                                <p className="text-ink font-bold truncate">
                                                    {accInfo?.title || 'Accesorio vinculado'}
                                                </p>
                                                {accInfo && (
                                                    <p className="text-stone-400 font-mono text-[11px]">
                                                        {formatPrice(accInfo.price)} c/u
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex shrink-0 items-center gap-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-ink-muted text-[11px] font-bold">Cant:</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            handleAccessoryQuantityChange(item.id, parseInt(e.target.value, 10) || 1)
                                                        }
                                                        className="bg-paper border-paper-dark w-14 rounded-lg border py-1 text-center font-mono text-xs"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAccessory(item.id)}
                                                    className="cursor-pointer rounded-lg p-1 text-stone-400 hover:text-red-600 transition-colors"
                                                    title="Quitar del combo"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-paper-dark/20 border-paper-dark/60 rounded-xl border p-3 text-center text-xs text-stone-400 italic">
                                No se han seleccionado accesorios todavía.
                            </div>
                        )}
                    </div>
                </div>

                {/* Card 4: Portada y Visibilidad */}
                <div className="bg-paper border-paper-dark/80 space-y-5 rounded-2xl border p-6 shadow-xs">
                    <h3 className="text-ink border-paper-dark/60 border-b pb-3 font-serif text-base font-bold">
                        Portada y Visibilidad
                    </h3>

                    <div className="space-y-4">
                        {/* Cover URL */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                URL de Portada / Imagen
                            </label>
                            <input
                                type="url"
                                value={form.data.cover_url}
                                onChange={(e) => form.setData('cover_url', e.target.value)}
                                placeholder="https://images.unsplash.com/... o https://ejemplo.com/combo.jpg"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-xs focus:ring-2"
                            />
                            {form.errors.cover_url && <p className="text-xs font-medium text-red-600">{form.errors.cover_url}</p>}
                        </div>

                        {/* Preview */}
                        {form.data.cover_url && (
                            <div className="bg-paper-dark/30 border-paper-dark/70 flex items-center gap-4 rounded-xl border p-3">
                                <img
                                    src={form.data.cover_url}
                                    alt="Vista previa"
                                    className="border-paper-dark/80 h-16 w-14 shrink-0 rounded-lg border object-cover shadow-2xs"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                <div className="text-ink-muted text-xs">
                                    <p className="text-ink font-semibold">Vista previa de imagen</p>
                                    <p className="text-[11px] text-stone-400">La imagen se renderizará en la sección de combos y el carrito.</p>
                                </div>
                            </div>
                        )}

                        {/* Active Checkbox */}
                        <div className="pt-2">
                            <label className="inline-flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(e) => form.setData('is_active', e.target.checked)}
                                    className="text-forest focus:ring-forest/40 h-4 w-4 rounded border-stone-300"
                                />
                                <div className="text-xs">
                                    <span className="text-ink font-bold">Publicar inmediatamente en el catálogo</span>
                                    <p className="text-ink-muted text-[11px]">
                                        Si se desmarca, el combo quedará guardado pero pausado para los clientes.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href="/admin/combos"
                        className="text-ink-muted hover:text-ink rounded-xl border border-stone-300 px-5 py-2.5 text-xs font-semibold transition-colors hover:bg-stone-200/50"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="bg-forest hover:bg-forest-light cursor-pointer rounded-xl px-6 py-2.5 font-serif text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50"
                    >
                        {form.processing ? 'Guardando...' : isEditing ? 'Actualizar Combo' : 'Registrar Combo'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

export default Form;
