import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';

interface CategoryItem {
    id: string;
    slug: string;
    label: string;
    emoji: string | null;
}

interface AccessoryItem {
    id: string;
    title: string;
    description: string | null;
    price: number | string;
    promo_quantity: number | null;
    promo_price: number | string | null;
    stock: number;
    category: string;
    cover_url: string | null;
    is_active: boolean;
}

interface FormProps {
    accessory?: AccessoryItem;
    categories: CategoryItem[];
}

export function Form({ accessory, categories }: FormProps) {
    const isEditing = Boolean(accessory);

    const form = useForm({
        title: accessory?.title || '',
        category: accessory?.category || (categories[0]?.slug ?? 'SEPARADORES'),
        price: accessory?.price !== undefined ? String(accessory.price) : '',
        promo_quantity: accessory?.promo_quantity ? String(accessory.promo_quantity) : '',
        promo_price: accessory?.promo_price ? String(accessory.promo_price) : '',
        stock: accessory?.stock !== undefined ? accessory.stock : 0,
        cover_url: accessory?.cover_url || '',
        description: accessory?.description || '',
        is_active: accessory ? accessory.is_active : true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && accessory) {
            form.put(`/admin/accesorios/${accessory.id}`);
        } else {
            form.post('/admin/accesorios');
        }
    };

    return (
        <AdminLayout
            title={isEditing ? `Editar: ${accessory?.title}` : 'Registrar Nuevo Accesorio'}
            subtitle={
                isEditing
                    ? 'Actualiza los datos del accesorio y su stock disponible'
                    : 'Completa el formulario para incorporar un nuevo accesorio a la tienda'
            }
            breadcrumbText="Volver al Listado"
            breadcrumbHref="/admin/accesorios"
        >
            <Head title={isEditing ? `Editar ${accessory?.title} - Admin` : 'Nuevo Accesorio - Admin'} />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 animate-fade-in">
                {/* Card 1: Información General del Accesorio */}
                <div className="bg-paper border-paper-dark/80 space-y-5 rounded-2xl border p-6 shadow-xs">
                    <h3 className="text-ink border-paper-dark/60 border-b pb-3 font-serif text-base font-bold">
                        Información del Accesorio
                    </h3>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* Title */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Título del Accesorio <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder="Ej. Vela Aromática Lavanda & Vainilla"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs placeholder:text-stone-400 focus:ring-2"
                                required
                            />
                            {form.errors.title && <p className="text-xs font-medium text-red-600">{form.errors.title}</p>}
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Categoría <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={form.data.category}
                                onChange={(e) => form.setData('category', e.target.value)}
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs focus:ring-2"
                                required
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>
                                        {cat.emoji ? `${cat.emoji} ${cat.label}` : cat.label}
                                    </option>
                                ))}
                            </select>
                            {form.errors.category && <p className="text-xs font-medium text-red-600">{form.errors.category}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-ink-muted text-xs font-bold tracking-wider uppercase">
                                Descripción y Características
                            </label>
                            <textarea
                                rows={4}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                                placeholder="Notas aromáticas, medidas, materiales o modo de uso..."
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
                                Precio Normal ($) <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.price}
                                onChange={(e) => form.setData('price', e.target.value)}
                                placeholder="Ej. 4500"
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
                                Cantidad Promo (Ej: 3)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.data.promo_quantity}
                                onChange={(e) => form.setData('promo_quantity', e.target.value)}
                                placeholder="Ej. 3 para 3x2"
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
                                placeholder="Ej. 11000"
                                className="bg-paper focus:ring-forest/40 focus:border-forest text-ink w-full rounded-xl border border-stone-300 px-3.5 py-2.5 font-mono text-xs focus:ring-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Card 3: Portada y Visibilidad */}
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
                                placeholder="https://images.unsplash.com/... o https://ejemplo.com/vela.jpg"
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
                                    <p className="text-[11px] text-stone-400">La imagen se renderizará en el catálogo y la ficha del producto.</p>
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
                                        Si se desmarca, el accesorio quedará guardado pero pausado para los clientes.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link
                        href="/admin/accesorios"
                        className="text-ink-muted hover:text-ink rounded-xl border border-stone-300 px-5 py-2.5 text-xs font-semibold transition-colors hover:bg-stone-200/50"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="bg-forest hover:bg-forest-light cursor-pointer rounded-xl px-6 py-2.5 font-serif text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50"
                    >
                        {form.processing ? 'Guardando...' : isEditing ? 'Actualizar Accesorio' : 'Registrar Accesorio'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}

export default Form;
