import type { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';
import { PageShell } from './page-shell';

interface AdminSharedData extends SharedData {
    flash?: {
        success?: string;
        error?: string;
    };
}

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    breadcrumbText?: string;
    breadcrumbHref?: string;
    action?: React.ReactNode;
}

export function AdminLayout({
    children,
    title,
    subtitle,
    breadcrumbText,
    breadcrumbHref,
    action,
}: AdminLayoutProps) {
    const { props, url } = usePage<AdminSharedData>();
    const flash = props.flash;

    const isHubMode = url === '/admin' || url === '/admin/';
    const isAccessoriesArea = url.includes('/accesorios');
    const isCombosArea = url.includes('/combos');
    const isOrdersArea = url.includes('/pedidos');
    const isConfigArea = url.includes('/configuracion');

    // Default breadcrumb logic matching original client
    const defaultBreadcrumbText = isHubMode ? 'Volver al Catálogo' : 'Volver al Panel Central';
    const defaultBreadcrumbHref = isHubMode ? '/libros' : '/admin';

    // Default title / subtitle logic matching original client
    let defaultTitle = 'Panel de Administración';
    let defaultSubtitle = 'Módulos de gestión y mantenimiento de Alma Lectora';

    if (isHubMode) {
        defaultTitle = 'Panel de Control General';
        defaultSubtitle = 'Módulos de gestión y administración centralizada';
    } else if (url.includes('/nuevo')) {
        if (isAccessoriesArea) {
            defaultTitle = 'Nuevo Accesorio';
            defaultSubtitle = 'Registrar un nuevo accesorio';
        } else if (isCombosArea) {
            defaultTitle = 'Nuevo Combo';
            defaultSubtitle = 'Crear un nuevo combo promocional';
        } else {
            defaultTitle = 'Nuevo Libro';
            defaultSubtitle = 'Registrar un nuevo libro en el catálogo';
        }
    } else if (url.includes('/editar')) {
        if (isAccessoriesArea) {
            defaultTitle = 'Editar Accesorio';
            defaultSubtitle = 'Modificar información y stock del accesorio';
        } else if (isCombosArea) {
            defaultTitle = 'Editar Combo';
            defaultSubtitle = 'Modificar información y productos del combo';
        } else {
            defaultTitle = 'Editar Libro';
            defaultSubtitle = 'Modificar información y stock del libro';
        }
    } else {
        if (isAccessoriesArea) {
            defaultTitle = 'Panel de Accesorios';
            defaultSubtitle = 'Gestión de Velas, Separadores y Modelos 3D';
        } else if (isCombosArea) {
            defaultTitle = 'Panel de Combos';
            defaultSubtitle = 'Gestión de Combos Promocionales y Paquetes de Regalo';
        } else if (isOrdersArea) {
            defaultTitle = 'Gestión de Pedidos';
            defaultSubtitle = 'Control de confirmaciones de compras, envíos y stock';
        } else if (isConfigArea) {
            defaultTitle = 'Configuración de Tienda';
            defaultSubtitle = 'Ajustes de contacto, costos de logística y catálogo dinámico';
        } else {
            defaultTitle = 'Panel de Libros';
            defaultSubtitle = 'Mantenimiento de inventario, ABM y carga rápida con escáner';
        }
    }

    const resolvedTitle = title ?? defaultTitle;
    const resolvedSubtitle = subtitle ?? defaultSubtitle;
    const resolvedBreadcrumbText = breadcrumbText ?? defaultBreadcrumbText;
    const resolvedBreadcrumbHref = breadcrumbHref ?? defaultBreadcrumbHref;

    // Action button defaults matching original client if none provided
    let resolvedAction = action;
    if (!resolvedAction) {
        if (url === '/admin/libros' || url === '/admin/libros/') {
            resolvedAction = (
                <Link
                    href="/admin/libros/nuevo"
                    className="bg-forest text-stone-100 hover:bg-forest-dark flex items-center justify-center rounded-xl px-4 py-2 text-xs font-serif font-bold shadow-xs transition-colors"
                >
                    + Nuevo Libro
                </Link>
            );
        } else if (url === '/admin/accesorios' || url === '/admin/accesorios/') {
            resolvedAction = (
                <Link
                    href="/admin/accesorios/nuevo"
                    className="bg-forest text-stone-100 hover:bg-forest-dark flex items-center justify-center rounded-xl px-4 py-2 text-xs font-serif font-bold shadow-xs transition-colors"
                >
                    + Nuevo Accesorio
                </Link>
            );
        } else if (url === '/admin/combos' || url === '/admin/combos/') {
            resolvedAction = (
                <Link
                    href="/admin/combos/nuevo"
                    className="bg-forest text-stone-100 hover:bg-forest-dark flex items-center justify-center rounded-xl px-4 py-2 text-xs font-serif font-bold shadow-xs transition-colors"
                >
                    + Nuevo Combo
                </Link>
            );
        }
    }

    return (
        <PageShell>
            <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8 animate-fade-in py-2 sm:py-6">
                {/* Flash Notifications */}
                {flash?.success && (
                    <div className="bg-forest/10 border-forest/30 text-forest flex items-center gap-3 rounded-xl border p-4 text-sm font-medium animate-fade-in">
                        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 animate-fade-in">
                        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                            />
                        </svg>
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Header bar matching original AdminLayout */}
                <div className="border-paper-dark/60 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <Link
                                href={resolvedBreadcrumbHref}
                                className="text-forest hover:underline flex items-center gap-1 text-xs font-semibold"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>
                                <span>{resolvedBreadcrumbText}</span>
                            </Link>
                        </div>
                        <h1 className="text-ink font-serif text-2xl sm:text-3xl font-bold">{resolvedTitle}</h1>
                        <p className="text-ink-muted text-xs sm:text-sm">{resolvedSubtitle}</p>
                    </div>

                    {resolvedAction && (
                        <div className="flex shrink-0 items-center gap-2">
                            {resolvedAction}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div>{children}</div>
            </div>
        </PageShell>
    );
}

export default AdminLayout;
