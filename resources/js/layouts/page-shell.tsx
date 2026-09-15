import React from 'react';
import { EditorialHeader } from '../components/layout/editorial-header';

interface PageShellProps {
  children: React.ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-sans selection:bg-forest/20 selection:text-forest">
      <EditorialHeader />

      {/* Content wrapper */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">{children}</main>

      {/* Footer */}
      <footer className="border-t border-paper-dark/60 bg-paper py-8 px-4 text-center mt-auto">
        <div className="max-w-6xl mx-auto space-y-2">
          <p className="text-xs text-ink-muted">
            &copy; {new Date().getFullYear()} Alma Lectora — Programación de Aplicaciones Web (PAW).
          </p>
          <p className="text-[11px] text-stone-400">
            Reconstrucción monolítica con Laravel 12/13, Inertia.js v2, React 19 y PostgreSQL.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PageShell;
