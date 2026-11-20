import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { ImageGalleryUpload } from '../../../components/admin/image-gallery-upload';
import { AdminLayout } from '../../../layouts/admin-layout';
import { normalizeSearchText } from '../../../lib/text';
import type { Author, Book } from '../../../types/alma';

interface FormProps {
    book?: Book;
    authors: Author[];
    genres?: string[];
    availableBadges?: string[];
}

export function Form({
    book,
    authors: allAuthors,
    genres = [],
    availableBadges = [],
}: FormProps) {
    const isEditing = Boolean(book);

    const initialAuthors = book?.authors?.map((a) => a.id) || [];
    const [authorInput, setAuthorInput] = useState('');
    const [showAuthorSuggestions, setShowAuthorSuggestions] = useState(false);

    const form = useForm({
        title: book?.title || '',
        isbn: book?.isbn || '',
        original_title: book?.original_title || book?.originalTitle || '',
        price: book?.price !== undefined ? String(book.price) : '',
        stock: book?.stock !== undefined ? String(book.stock) : '0',
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
        additional_images: (book?.additional_images || []) as string[],
        published_date: book?.published_date || '',
        language: book?.language || 'es',
        authors: initialAuthors as string[],
    });

    const [showGenreSuggestions, setShowGenreSuggestions] = useState(false);

    const handleAddAuthor = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        const normalizedInput = normalizeSearchText(trimmed);

        // Check if already in authors list (either by ID or by name, accent-insensitive)
        const isAlreadyAdded = form.data.authors.some((item) => {
            if (normalizeSearchText(item) === normalizedInput) return true;
            const existing = allAuthors.find((a) => a.id === item);
            return existing && normalizeSearchText(existing.name) === normalizedInput;
        });

        if (!isAlreadyAdded) {
            // Find existing author in DB to prefer UUID if available
            const matchingDbAuthor = allAuthors.find(
                (a) => normalizeSearchText(a.name) === normalizedInput
            );
            const valueToAdd = matchingDbAuthor ? matchingDbAuthor.id : trimmed;
            form.setData('authors', [...form.data.authors, valueToAdd]);
        }

        setAuthorInput('');
        setShowAuthorSuggestions(false);
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

    const suggestedGenres = genres.length > 0
        ? genres
        : [
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

    const suggestedBadges = availableBadges.length > 0
        ? availableBadges
        : ['Destacado', 'Novedad', 'Exclusivo'];

    const normalizedAuthorInput = normalizeSearchText(authorInput);
    const filteredAuthorSuggestions = normalizedAuthorInput
        ? allAuthors.filter(
              (a) =>
                  !form.data.authors.includes(a.id) &&
                  normalizeSearchText(a.name).includes(normalizedAuthorInput)
          )
        : [];

    const normalizedGenreInput = normalizeSearchText(form.data.genre);
    const filteredGenreSuggestions = normalizedGenreInput
        ? suggestedGenres.filter(
              (g) =>
                  normalizeSearchText(g).includes(normalizedGenreInput) &&
                  g.trim().toLowerCase() !== form.data.genre.trim().toLowerCase()
          )
        : [];

    return (
        <AdminLayout
            title={isEditing ? `Editar: ${book?.title}` : 'Registrar Nuevo Libro'}
            subtitle={
                isEditing
                    ? 'Actualiza los datos del libro y su inventario'
                    : 'Completa el formulario para incorporar un nuevo título al catálogo'
            }
            breadcrumbText="Volver al Listado"
            breadcrumbHref="/admin/libros"
        >
            <Head title={isEditing ? `Editar ${book?.title} - Admin` : 'Nuevo Libro - Admin'} />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
                {/* Card 1: Información Fundamental */}
                <div className="bg-paper border-paper-dark/80 space-y-5 rounded-2xl border p-6 shadow-xs">
                    <h3 className="text-ink border-paper-dark/60 border-b pb-3 font-serif text-base font-bold">
                        Información del Libro
                    </h3>

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
                            {form.errors.title && (
                                <p className="text-xs font-medium text-red-600">{form.errors.title}</p>
                            )}
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
                            {form.errors.isbn && (
                                <p className="text-xs font-medium text-red-600">{form.errors.isbn}</p>
                            )}
                        </div>

                        {/* Original Title */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Título Original (Opcional)
                            </label>
                            <input
                                type="text"
                                value={form.data.original_title}
                                onChange={(e) => form.setData('original_title', e.target.value)}
                                placeholder="Título en idioma original si aplica"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs placeholder:text-stone-400 focus:ring-2"
                            />
                        </div>

                        {/* Autores Unificados con Autocompletado */}
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                    Autores
                                </label>
                                <span className="text-[11px] text-stone-400">
                                    Escribe el nombre: se autocompleta con autores existentes o presiona Enter para crear uno nuevo
                                </span>
                            </div>

                            {/* Selected Authors Chips */}
                            <div className="bg-paper-dark/30 border-paper-dark flex min-h-[36px] flex-wrap gap-2 rounded-xl border p-2">
                                {form.data.authors.length === 0 ? (
                                    <span className="self-center px-1 text-xs text-stone-400 italic">
                                        No hay autores asignados. Escribe el autor en el campo inferior.
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

                            {/* Single Unified Autocomplete Author Input */}
                            <div className="relative">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={authorInput}
                                        onChange={(e) => {
                                            setAuthorInput(e.target.value);
                                            setShowAuthorSuggestions(true);
                                        }}
                                        onFocus={() => setShowAuthorSuggestions(true)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (filteredAuthorSuggestions.length > 0) {
                                                    handleAddAuthor(filteredAuthorSuggestions[0].id);
                                                } else {
                                                    handleAddAuthor(authorInput);
                                                }
                                            } else if (e.key === 'Tab' && filteredAuthorSuggestions.length > 0) {
                                                e.preventDefault();
                                                handleAddAuthor(filteredAuthorSuggestions[0].id);
                                            }
                                        }}
                                        placeholder="Escribe el nombre del autor (ej: Gabriel García Márquez, Jorge Luis Borges)..."
                                        className="bg-paper focus:ring-forest/40 focus:border-forest text-ink flex-1 rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs placeholder:text-stone-400 focus:ring-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleAddAuthor(authorInput)}
                                        disabled={!authorInput.trim()}
                                        className="bg-forest hover:bg-forest-light cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-40"
                                    >
                                        + Agregar
                                    </button>
                                </div>

                                {/* Dynamic Suggestions Dropdown */}
                                {showAuthorSuggestions && filteredAuthorSuggestions.length > 0 && (
                                    <div className="bg-paper border-paper-dark absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border p-1 shadow-lg">
                                        <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-stone-400 uppercase">
                                            Sugerencias en base de datos (Presiona Tab o haz clic):
                                        </div>
                                        {filteredAuthorSuggestions.map((suggested) => (
                                            <button
                                                key={suggested.id}
                                                type="button"
                                                onClick={() => handleAddAuthor(suggested.id)}
                                                className="hover:bg-forest/10 hover:text-forest flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-stone-700"
                                            >
                                                <span>{suggested.name}</span>
                                                <span className="text-[10px] text-stone-400">Existente</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {form.errors.authors && (
                                <p className="text-xs font-medium text-red-600">{form.errors.authors}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Card 2: Precios, Promociones y Stock */}
                <div className="bg-paper border-paper-dark/80 space-y-5 rounded-2xl border p-6 shadow-xs">
                    <h3 className="text-ink border-paper-dark/60 border-b pb-3 font-serif text-base font-bold">
                        Precio e Inventario
                    </h3>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
                        {/* Price */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Precio ($) <span className="text-red-600">*</span>
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
                            {form.errors.price && (
                                <p className="text-xs font-medium text-red-600">{form.errors.price}</p>
                            )}
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
                                onChange={(e) => form.setData('stock', e.target.value)}
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-xs focus:ring-2"
                                required
                            />
                            {form.errors.stock && (
                                <p className="text-xs font-medium text-red-600">{form.errors.stock}</p>
                            )}
                        </div>

                        {/* Promo Quantity */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Cantidad Promo (Ej: 2)
                            </label>
                            <input
                                type="number"
                                min="2"
                                value={form.data.promo_quantity}
                                onChange={(e) =>
                                    form.setData('promo_quantity', e.target.value ? parseInt(e.target.value, 10) : '')
                                }
                                placeholder="Ej. 2 para 2x1"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-xs focus:ring-2"
                            />
                            {form.errors.promo_quantity && (
                                <p className="text-xs font-medium text-red-600">{form.errors.promo_quantity}</p>
                            )}
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
                            {form.errors.promo_price && (
                                <p className="text-xs font-medium text-red-600">{form.errors.promo_price}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Card 3: Clasificación, Fotos y Detalles Editoriales */}
                <div className="bg-paper border-paper-dark/80 space-y-5 rounded-2xl border p-6 shadow-xs">
                    <h3 className="text-ink border-paper-dark/60 border-b pb-3 font-serif text-base font-bold">
                        Detalles Editoriales, Clasificación y Fotografías
                    </h3>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* Genre Autocomplete */}
                        <div className="relative space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Género Literario
                            </label>
                            <input
                                type="text"
                                value={form.data.genre}
                                onChange={(e) => {
                                    form.setData('genre', e.target.value);
                                    setShowGenreSuggestions(true);
                                }}
                                onFocus={() => setShowGenreSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowGenreSuggestions(false), 200)}
                                placeholder="Ej. Fantasía, Novela Histórica..."
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs focus:ring-2"
                            />
                            {showGenreSuggestions && filteredGenreSuggestions.length > 0 && (
                                <div className="bg-paper border-paper-dark absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border p-1 shadow-lg">
                                    {filteredGenreSuggestions.map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onMouseDown={() => {
                                                form.setData('genre', g);
                                                setShowGenreSuggestions(false);
                                            }}
                                            className="hover:bg-forest/10 hover:text-forest flex w-full cursor-pointer items-center rounded-lg px-3 py-1.5 text-xs text-stone-700"
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Badge Select */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Etiqueta Destacada (Badge)
                            </label>
                            <select
                                value={form.data.badge}
                                onChange={(e) => form.setData('badge', e.target.value)}
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs focus:ring-2"
                            >
                                <option value="">-- Sin etiqueta destacada --</option>
                                {suggestedBadges.map((b) => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Language */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Idioma
                            </label>
                            <select
                                value={form.data.language}
                                onChange={(e) => form.setData('language', e.target.value)}
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs focus:ring-2"
                            >
                                <option value="es">Español (es)</option>
                                <option value="en">Inglés (en)</option>
                                <option value="pt">Portugués (pt)</option>
                                <option value="fr">Francés (fr)</option>
                                <option value="it">Italiano (it)</option>
                                <option value="de">Alemán (de)</option>
                                {form.data.language &&
                                    !['es', 'en', 'pt', 'fr', 'it', 'de'].includes(form.data.language) && (
                                        <option value={form.data.language}>{form.data.language}</option>
                                    )}
                            </select>
                            {form.errors.language && (
                                <p className="text-xs font-medium text-red-600">{form.errors.language}</p>
                            )}
                        </div>

                        {/* Published Date */}
                        <div className="space-y-1.5">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Fecha / Año de Publicación
                            </label>
                            <input
                                type="text"
                                maxLength={50}
                                value={form.data.published_date}
                                onChange={(e) => form.setData('published_date', e.target.value)}
                                placeholder="Ej. 1967 o 2024-05-01"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs placeholder:text-stone-400 focus:ring-2"
                            />
                            {form.errors.published_date && (
                                <p className="text-xs font-medium text-red-600">{form.errors.published_date}</p>
                            )}
                        </div>

                        {/* Image Gallery Upload (3 slots: 1 cover + 2 extra) */}
                        <div className="md:col-span-2">
                            <ImageGalleryUpload
                                coverUrl={form.data.cover_url}
                                additionalImages={form.data.additional_images}
                                onCoverChange={(url) => form.setData('cover_url', url)}
                                onAdditionalImagesChange={(images) => form.setData('additional_images', images)}
                                disabled={form.processing}
                            />
                            {form.errors.cover_url && (
                                <p className="mt-1 text-xs font-medium text-red-600">{form.errors.cover_url}</p>
                            )}
                        </div>

                        {/* Synopsis */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Sinopsis / Reseña
                            </label>
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
