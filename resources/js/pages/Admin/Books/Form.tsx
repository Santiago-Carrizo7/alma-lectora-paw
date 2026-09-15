import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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
    promo_price: book?.promo_price !== undefined && book?.promo_price !== null
      ? String(book.promo_price)
      : (book?.promoPrice !== undefined && book?.promoPrice !== null ? String(book.promoPrice) : ''),
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
      form.data.authors.filter((item) => item !== itemToRemove)
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
        isEditing
          ? 'Actualiza los datos del libro y su inventario'
          : 'Completa el formulario para incorporar un nuevo título al catálogo'
      }
      breadcrumbText="Volver al Listado"
      breadcrumbHref="/admin/libros"
    >
      <Head title={isEditing ? `Editar ${book?.title} - Admin` : 'Nuevo Libro - Admin'} />

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {/* Card 1: Información Fundamental */}
        <div className="bg-paper rounded-2xl border border-paper-dark/80 p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold font-serif text-ink border-b border-paper-dark/60 pb-3">
            Información del Libro
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Título del Libro <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={form.data.title}
                onChange={(e) => form.setData('title', e.target.value)}
                placeholder="Ej. Cien años de soledad"
                className="w-full px-3.5 py-2.5 text-xs bg-paper border border-stone-300 rounded-xl focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink placeholder:text-stone-400"
                required
              />
              {form.errors.title && (
                <p className="text-xs text-red-600 font-medium">{form.errors.title}</p>
              )}
            </div>

            {/* ISBN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                ISBN (Código Único) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={form.data.isbn}
                onChange={(e) => form.setData('isbn', e.target.value)}
                placeholder="Ej. 9780307474728"
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-paper border border-stone-300 rounded-xl focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink placeholder:text-stone-400"
                required
              />
              {form.errors.isbn && (
                <p className="text-xs text-red-600 font-medium">{form.errors.isbn}</p>
              )}
            </div>

            {/* Original Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Título Original (Opcional)
              </label>
              <input
                type="text"
                value={form.data.original_title}
                onChange={(e) => form.setData('original_title', e.target.value)}
                placeholder="Título en idioma original si aplica"
                className="w-full px-3.5 py-2.5 text-xs bg-paper border border-stone-300 rounded-xl focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink placeholder:text-stone-400"
              />
            </div>

            {/* Autores Dinámicos */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Autores
                </label>
                <span className="text-[11px] text-stone-400">
                  Selecciona de la lista o escribe para crear uno nuevo
                </span>
              </div>

              {/* Selected Authors Chips */}
              <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-paper-dark/30 border border-paper-dark rounded-xl">
                {form.data.authors.length === 0 ? (
                  <span className="text-xs text-stone-400 italic self-center px-1">
                    No hay autores asignados. Agrega al menos uno abajo.
                  </span>
                ) : (
                  form.data.authors.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-paper border border-forest/30 text-forest text-xs font-semibold shadow-2xs"
                    >
                      <span>{getAuthorLabel(item)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAuthor(item)}
                        className="hover:text-red-600 transition-colors cursor-pointer text-stone-400"
                        title="Quitar autor"
                      >
                        &times;
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Author Selector & New Input */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) handleAddAuthor(e.target.value);
                  }}
                  className="w-full sm:w-1/2 px-3.5 py-2 text-xs bg-paper border border-stone-300 rounded-xl text-ink focus:ring-2 focus:ring-forest/40 focus:border-forest"
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

                <div className="w-full sm:w-1/2 flex gap-2">
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
                    className="flex-1 px-3.5 py-2 text-xs bg-paper border border-stone-300 rounded-xl focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink placeholder:text-stone-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAuthor(authorInput)}
                    className="px-3 py-2 text-xs font-semibold rounded-xl bg-paper-dark hover:bg-stone-300 text-ink border border-stone-300 transition-colors cursor-pointer"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
              {form.errors.authors && (
                <p className="text-xs text-red-600 font-medium">{form.errors.authors}</p>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Precios, Promociones y Stock */}
        <div className="bg-paper rounded-2xl border border-paper-dark/80 p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold font-serif text-ink border-b border-paper-dark/60 pb-3">
            Precio e Inventario
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Precio Normal ($) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.data.price}
                onChange={(e) => form.setData('price', e.target.value)}
                placeholder="Ej. 18500"
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-paper border border-stone-300 rounded-xl focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink"
                required
              />
              {form.errors.price && (
                <p className="text-xs text-red-600 font-medium">{form.errors.price}</p>
              )}
            </div>

            {/* Stock */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Stock (Unidades) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.data.stock}
                onChange={(e) => form.setData('stock', parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-paper border border-stone-300 rounded-xl focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink"
                required
              />
              {form.errors.stock && (
                <p className="text-xs text-red-600 font-medium">{form.errors.stock}</p>
              )}
            </div>

            {/* Promo Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Cantidad Promo (Ej: 2)
              </label>
              <input
                type="number"
                min="2"
                value={form.data.promo_quantity}
                onChange={(e) => form.setData('promo_quantity', e.target.value ? parseInt(e.target.value, 10) : '')}
                placeholder="Ej. 2 para 2x1"
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-paper border border-stone-300 rounded-xl focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink"
              />
            </div>

            {/* Promo Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Precio Promo Total ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.data.promo_price}
                onChange={(e) => form.setData('promo_price', e.target.value)}
                placeholder="Ej. 30000"
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-paper border border-stone-300 rounded-xl focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Clasificación y Detalles Editoriales */}
        <div className="bg-paper rounded-2xl border border-paper-dark/80 p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold font-serif text-ink border-b border-paper-dark/60 pb-3">
            Detalles Editoriales y Clasificación
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Genre */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Género Literario
              </label>
              <input
                type="text"
                list="genres-list"
                value={form.data.genre}
                onChange={(e) => form.setData('genre', e.target.value)}
                placeholder="Ej. Fantasía"
                className="w-full px-3.5 py-2.5 text-xs bg-paper border border-stone-300 rounded-xl focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink"
              />
              <datalist id="genres-list">
                {suggestedGenres.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>

            {/* Badge */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Etiqueta Destacada (Badge)
              </label>
              <input
                type="text"
                list="badges-list"
                value={form.data.badge}
                onChange={(e) => form.setData('badge', e.target.value)}
                placeholder="Ej. Novedad"
                className="w-full px-3.5 py-2.5 text-xs bg-paper border border-stone-300 rounded-xl focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink"
              />
              <datalist id="badges-list">
                {suggestedBadges.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            {/* Cover URL */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                URL de Portada
              </label>
              <input
                type="text"
                value={form.data.cover_url}
                onChange={(e) => form.setData('cover_url', e.target.value)}
                placeholder="https://images.unsplash.com/... o /images/..."
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-paper border border-stone-300 rounded-xl focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink"
              />
              {form.errors.cover_url && (
                <p className="text-xs text-red-600 font-medium">{form.errors.cover_url}</p>
              )}
            </div>

            {/* Synopsis */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Sinopsis / Reseña
              </label>
              <textarea
                rows={4}
                value={form.data.synopsis}
                onChange={(e) => form.setData('synopsis', e.target.value)}
                placeholder="Sinopsis descriptiva del libro..."
                className="w-full px-3.5 py-2.5 text-xs bg-paper border border-stone-300 rounded-xl focus:ring-2 focus:ring-forest/40 focus:border-forest text-ink leading-relaxed"
              />
            </div>

            {/* Visibilidad Checkbox */}
            <div className="md:col-span-2 pt-2">
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.data.is_active}
                  onChange={(e) => form.setData('is_active', e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-forest focus:ring-forest/40"
                />
                <div className="text-xs">
                  <span className="font-bold text-ink">Publicar inmediatamente en el catálogo</span>
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
            className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-stone-200/50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={form.processing}
            className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-serif font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {form.processing
              ? 'Guardando...'
              : isEditing
              ? 'Actualizar Libro'
              : 'Registrar Libro'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

export default Form;
