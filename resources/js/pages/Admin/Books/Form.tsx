import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';
import type { Author, Book } from '../../../types/alma';

interface FormProps {
    book?: Book;
    authors: Author[];
}

export function Form({ book, authors: allAuthors }: FormProps) {
    const isEditing = Boolean(book);

    // Initial author items: array of { idOrName: string, label: string }
    const initialAuthors = book?.authors?.map((a) => a.id) || [];
    const [authorInput, setAuthorInput] = useState('');

    const form = useForm({
        title: book?.title || '',
        isbn: book?.isbn || '',
        original_title: book?.original_title || book?.originalTitle || '',
        price: book?.price !== undefined ? String(book.price) : '',
        stock: book?.stock !== undefined ? book.stock : 0,
        genre: book?.genre || '',
        badge: book?.badge || '',
        promo_quantity: book?.promo_quantity || book?.promoQuantity || '',
        promo_price:
            book?.promo_price !== undefined && book?.promo_price !== null
                ? String(book.promo_price)
                : book?.promoPrice !== undefined && book?.promoPrice !== null
                  ? String(book.promoPrice)
                  : '',
        is_active: book ? (book.is_active ?? book.isActive ?? true) : true,
        synopsis: book?.synopsis || '',
        cover_url: book?.cover_url || book?.coverUrl || '',
        published_date: book?.published_date || '',
        language: book?.language || 'es',
        authors: initialAuthors as string[],
    });

    // Helpers for dynamic author selection
    const handleAddAuthor = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;

        if (!form.data.authors.includes(trimmed)) {
            form.setData('authors', [...form.data.authors, trimmed]);
        }
        setAuthorInput('');
    };

    const handleRemoveAuthor = (itemToRemove: string) => {
        form.setData(
            'authors',
            form.data.authors.filter((item) => item !== itemToRemove),
        );
    };

    const getAuthorLabel = (idOrName: string): string => {
        const found = allAuthors.find((a) => a.id === idOrName);
        return found ? found.name : idOrName;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing && book) {
            form.put(`/admin/libros/${book.id}`);
        } else {
            form.post('/admin/libros');
        }
    };

    const suggestedGenres = [
        'Fantasía',
        'Novela Histórica',
        'Desarrollo Personal',
        'Ciencia Ficción',
        'Romance',
        'Terror',
        'Filosofía',
        'Infantil',
        'Ensayo',
    ];

    const suggestedBadges = ['Novedad', 'Bestseller', 'Oferta', 'Exclusivo', 'Recomendado'];

    return (
        <AdminLayout
            title={isEditing ? `Editar: ${book?.title}` : 'Registrar Nuevo Libro'}
            subtitle={
                isEditing ? 'Actualiza los datos del libro y su inventario' : 'Completa el formulario para incorporar un nuevo título al catálogo'
            }
            breadcrumbText="Volver al Listado"
            breadcrumbHref="/admin/libros"
        >
            <Head title={isEditing ? `Editar ${book?.title} - Admin` : 'Nuevo Libro - Admin'} />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
                {/* Card 1: Información Fundamental */}
                <div className="bg-paper border-paper-dark/80 space-y-5 rounded-2xl border p-6 shadow-xs">
                    <h3 className="text-ink border-paper-dark/60 border-b pb-3 font-serif text-base font-bold">Información del Libro</h3>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* Title */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Título del Libro <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder="Ej. Cien años de soledad"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs placeholder:text-stone-400 focus:ring-2"
                                required
                            />
                            {form.errors.title && <p className="text-xs font-medium text-red-600">{form.errors.title}</p>}
                        </div>

                        {/* ISBN */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                ISBN (Código Único) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.data.isbn}
                                onChange={(e) => form.setData('isbn', e.target.value)}
                                placeholder="Ej. 9780307474728"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-xs placeholder:text-stone-400 focus:ring-2"
                                required
                            />
                            {form.errors.isbn && <p className="text-xs font-medium text-red-600">{form.errors.isbn}</p>}
                        </div>

                        {/* Original Title */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">Título Original (Opcional)</label>
                            <input
                                type="text"
                                value={form.data.original_title}
                                onChange={(e) => form.setData('original_title', e.target.value)}
                                placeholder="Título en idioma original si aplica"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs placeholder:text-stone-400 focus:ring-2"
                            />
                        </div>

                        {/* Autores Dinámicos */}
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">Autores</label>
                                <span className="text-[11px] text-stone-400">Selecciona de la lista o escribe para crear uno nuevo</span>
                            </div>

                            {/* Selected Authors Chips */}
                            <div className="bg-paper-dark/30 border-paper-dark flex min-h-[36px] flex-wrap gap-2 rounded-xl border p-2">
                                {form.data.authors.length === 0 ? (
                                    <span className="self-center px-1 text-xs text-stone-400 italic">
                                        No hay autores asignados. Agrega al menos uno abajo.
                                    </span>
                                ) : (
                                    form.data.authors.map((item) => (
                                        <span
                                            key={item}
                                            className="bg-paper border-forest/30 text-forest inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold shadow-2xs"
                                        >
                                            <span>{getAuthorLabel(item)}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAuthor(item)}
                                                className="cursor-pointer text-stone-400 transition-colors hover:text-red-600"
                                                title="Quitar autor"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>

                            {/* Author Selector & New Input */}
                            <div className="flex flex-col items-center gap-2 sm:flex-row">
                                <select
                                    value=""
                                    onChange={(e) => {
                                        if (e.target.value) handleAddAuthor(e.target.value);
                                    }}
                                    className="bg-paper text-ink focus:ring-forest/40 focus:border-forest w-full rounded-xl border border-stone-300 px-3.5 py-2 text-xs focus:ring-2 sm:w-1/2"
                                >
                                    <option value="">-- Seleccionar autor existente --</option>
                                    {allAuthors
                                        .filter((a) => !form.data.authors.includes(a.id))
                                        .map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.name}
                                            </option>
                                        ))}
                                </select>

                                <div className="flex w-full gap-2 sm:w-1/2">
                                    <input
                                        type="text"
                                        value={authorInput}
                                        onChange={(e) => setAuthorInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddAuthor(authorInput);
                                            }
                                        }}
                                        placeholder="O escribe nombre de autor nuevo..."
                                        className="bg-paper focus:ring-forest/40 focus:border-forest text-ink flex-1 rounded-xl border border-stone-300 px-3.5 py-2 text-xs placeholder:text-stone-400 focus:ring-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleAddAuthor(authorInput)}
                                        className="bg-paper-dark text-ink cursor-pointer rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold transition-colors hover:bg-stone-300"
                                    >
                                        + Agregar
                                    </button>
                                </div>
                            </div>
                            {form.errors.authors && <p className="text-xs font-medium text-red-600">{form.errors.authors}</p>}
                        </div>
                    </div>
                </div>

                {/* Card 2: Precios, Promociones y Stock */}
                <div className="bg-paper border-paper-dark/80 space-y-5 rounded-2xl border p-6 shadow-xs">
                    <h3 className="text-ink border-paper-dark/60 border-b pb-3 font-serif text-base font-bold">Precio e Inventario</h3>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
                        {/* Price */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Precio Normal ($) <span className="text-red-600">*</span>
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
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">Cantidad Promo (Ej: 2)</label>
                            <input
                                type="number"
                                min="2"
                                value={form.data.promo_quantity}
                                onChange={(e) => form.setData('promo_quantity', e.target.value ? parseInt(e.target.value, 10) : '')}
                                placeholder="Ej. 2 para 2x1"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-xs focus:ring-2"
                            />
                        </div>

                        {/* Promo Price */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">Precio Promo Total ($)</label>
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

                {/* Card 3: Clasificación y Detalles Editoriales */}
                <div className="bg-paper border-paper-dark/80 space-y-5 rounded-2xl border p-6 shadow-xs">
                    <h3 className="text-ink border-paper-dark/60 border-b pb-3 font-serif text-base font-bold">
                        Detalles Editoriales y Clasificación
                    </h3>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* Genre */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">Género Literario</label>
                            <input
                                type="text"
                                list="genres-list"
                                value={form.data.genre}
                                onChange={(e) => form.setData('genre', e.target.value)}
                                placeholder="Ej. Fantasía"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs focus:ring-2"
                            />
                            <datalist id="genres-list">
                                {suggestedGenres.map((g) => (
                                    <option key={g} value={g} />
                                ))}
                            </datalist>
                        </div>

                        {/* Badge */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">Etiqueta Destacada (Badge)</label>
                            <input
                                type="text"
                                list="badges-list"
                                value={form.data.badge}
                                onChange={(e) => form.setData('badge', e.target.value)}
                                placeholder="Ej. Novedad"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs focus:ring-2"
                            />
                            <datalist id="badges-list">
                                {suggestedBadges.map((b) => (
                                    <option key={b} value={b} />
                                ))}
                            </datalist>
                        </div>

                        {/* Cover URL */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">URL de Portada</label>
                            <input
                                type="text"
                                value={form.data.cover_url}
                                onChange={(e) => form.setData('cover_url', e.target.value)}
                                placeholder="https://images.unsplash.com/... o /images/..."
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-xs focus:ring-2"
                            />
                            {form.errors.cover_url && <p className="text-xs font-medium text-red-600">{form.errors.cover_url}</p>}
                        </div>

                        {/* Synopsis */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">Sinopsis / Reseña</label>
                            <textarea
                                rows={4}
                                value={form.data.synopsis}
                                onChange={(e) => form.setData('synopsis', e.target.value)}
                                placeholder="Sinopsis descriptiva del libro..."
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs leading-relaxed focus:ring-2"
                            />
                        </div>

                        {/* Visibilidad Checkbox */}
                        <div className="pt-2 md:col-span-2">
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
                                        Si se desmarca, el libro quedará guardado pero pausado para los clientes.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href="/admin/libros"
                        className="text-ink-muted hover:text-ink rounded-xl border border-stone-300 px-5 py-2.5 text-xs font-semibold transition-colors hover:bg-stone-200/50"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="bg-forest hover:bg-forest-light cursor-pointer rounded-xl px-6 py-2.5 font-serif text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50"
                    >
                        {form.processing ? 'Guardando...' : isEditing ? 'Actualizar Libro' : 'Registrar Libro'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

export default Form;
