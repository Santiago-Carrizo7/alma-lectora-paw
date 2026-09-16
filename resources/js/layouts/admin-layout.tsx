import type { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import React from 'react';

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
    title = 'Panel de Administración',
    subtitle = 'Módulos de gestión y mantenimiento de inventario',
    breadcrumbText,
    breadcrumbHref = '/admin',
    action,
}: AdminLayoutProps) {
    const { props } = usePage<AdminSharedData>();
    const user = props.auth?.user;
    const flash = props.flash;

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <div className="bg-paper text-ink selection:bg-forest/20 selection:text-forest flex min-h-screen flex-col font-sans">
            {/* Top Admin Navigation */}
            <header className="bg-paper/95 border-paper-dark/80 sticky top-0 z-40 border-b px-4 py-3 shadow-xs backdrop-blur-md sm:px-6">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/admin" className="group flex items-center gap-2">
                            <svg
                                className="text-forest h-6 w-6 transition-transform duration-300 group-hover:scale-105"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                            <div className="flex flex-col">
                                <span className="text-ink font-serif text-lg leading-none font-bold tracking-tight">Alma Lectora</span>
                                <span className="text-forest text-[10px] font-semibold tracking-wider uppercase">Panel Admin</span>
                            </div>
                        </Link>

                        <nav className="text-ink-muted hidden items-center gap-4 text-xs font-semibold tracking-wider uppercase md:flex">
                            <Link
                                href="/admin"
                                className={`rounded-lg px-3 py-1.5 transition-colors ${
                                    page.url === '/admin' ? 'bg-forest/10 text-forest font-bold' : 'hover:text-forest'
                                }`}
                            >
                                Hub
                            </Link>
                            <Link
                                href="/admin/libros"
                                className={`rounded-lg px-3 py-1.5 transition-colors ${
                                    page.url.startsWith('/admin/libros') ? 'bg-forest/10 text-forest font-bold' : 'hover:text-forest'
                                }`}
                            >
                                Libros
                            </Link>
                            <Link
                                href="/libros"
                                className="hover:text-forest rounded-lg px-3 py-1.5 text-stone-400 transition-colors"
                                target="_blank"
                                title="Abrir tienda en nueva pestaña"
                            >
                                Ver Tienda ↗
                            </Link>
                        </nav>
                    </div>

                    {/* User profile & actions */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <div className="hidden text-right sm:block">
                                <div className="text-ink text-xs font-semibold">{user.name}</div>
                                <div className="text-forest text-[10px] font-bold tracking-wider uppercase">
                                    {user.role === 'admin' ? 'Administrador' : user.role}
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleLogout}>
                            <button
                                type="submit"
                                className="hover:text-ink cursor-pointer rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-200/60"
                            >
                                Cerrar Sesión
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main Layout Container */}
            <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
                {/* Flash Notifications */}
                {flash?.success && (
                    <div className="bg-forest/10 border-forest/30 text-forest animate-fade-in flex items-center gap-3 rounded-xl border p-4 text-sm font-medium">
                        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="animate-fade-in flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
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

                {/* Section Header */}
                <div className="border-paper-dark/70 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        {breadcrumbText && (
                            <div className="mb-1 flex items-center gap-1.5">
                                <Link href={breadcrumbHref} className="text-forest flex items-center gap-1 text-xs font-semibold hover:underline">
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                    </svg>
                                    {breadcrumbText}
                                </Link>
                            </div>
                        )}
                        <h1 className="text-ink font-serif text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
                        <p className="text-ink-muted text-xs sm:text-sm">{subtitle}</p>
                    </div>

                    {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
                </div>

                {/* Content */}
                <div className="animate-fade-in">{children}</div>
            </main>

            {/* Admin Footer */}
            <footer className="border-paper-dark/60 bg-paper mt-auto border-t px-4 py-6 text-center">
                <div className="mx-auto max-w-6xl space-y-1">
                    <p className="text-ink-muted text-xs">Panel de Gestión Administrativa — &copy; {new Date().getFullYear()} Alma Lectora</p>
                    <p className="text-[11px] text-stone-400">Arquitectura Monolítica con Laravel 12/13, Inertia.js v2 y React 19</p>
                </div>
            </footer>
        </div>
    );
}

export default AdminLayout;
