import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ButtonEditorial } from '../components/ui/button-editorial';

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
  const page = usePage();
  const user = (page.props as any)?.auth?.user;
  const flash = (page.props as any)?.flash;

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/logout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-sans selection:bg-forest/20 selection:text-forest">
      {/* Top Admin Navigation */}
      <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b border-paper-dark/80 py-3 px-4 sm:px-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="group flex items-center gap-2">
              <svg
                className="w-6 h-6 text-forest group-hover:scale-105 transition-transform duration-300"
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
                <span className="text-lg font-bold font-serif text-ink tracking-tight leading-none">Alma Lectora</span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-forest">Panel Admin</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  page.url === '/admin' ? 'bg-forest/10 text-forest font-bold' : 'hover:text-forest'
                }`}
              >
                Hub
              </Link>
              <Link
                href="/admin/libros"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  page.url.startsWith('/admin/libros') ? 'bg-forest/10 text-forest font-bold' : 'hover:text-forest'
                }`}
              >
                Libros
              </Link>
              <Link
                href="/libros"
                className="px-3 py-1.5 rounded-lg transition-colors hover:text-forest text-stone-400"
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
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-ink">{user.name}</div>
                <div className="text-[10px] uppercase font-bold text-forest tracking-wider">
                  {user.role === 'admin' ? 'Administrador' : user.role}
                </div>
              </div>
            )}
            <form onSubmit={handleLogout}>
              <button
                type="submit"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-200/60 hover:text-ink transition-colors cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Flash Notifications */}
        {flash?.success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-forest/10 border border-forest/30 text-forest text-sm font-medium animate-fade-in">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span>{flash.success}</span>
          </div>
        )}
        {flash?.error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-fade-in">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{flash.error}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-paper-dark/70 pb-5 gap-4">
          <div className="space-y-1">
            {breadcrumbText && (
              <div className="flex items-center gap-1.5 mb-1">
                <Link
                  href={breadcrumbHref}
                  className="text-xs text-forest hover:underline flex items-center gap-1 font-semibold"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                  {breadcrumbText}
                </Link>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink tracking-tight">{title}</h1>
            <p className="text-xs sm:text-sm text-ink-muted">{subtitle}</p>
          </div>

          {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
        </div>

        {/* Content */}
        <div className="animate-fade-in">{children}</div>
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-paper-dark/60 bg-paper py-6 px-4 text-center mt-auto">
        <div className="max-w-6xl mx-auto space-y-1">
          <p className="text-xs text-ink-muted">
            Panel de Gestión Administrativa — &copy; {new Date().getFullYear()} Alma Lectora
          </p>
          <p className="text-[11px] text-stone-400">
            Arquitectura Monolítica con Laravel 12/13, Inertia.js v2 y React 19
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AdminLayout;
