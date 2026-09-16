import React from 'react';
import { EditorialHeader } from '../components/layout/editorial-header';

interface PageShellProps {
    children: React.ReactNode;
}

export function PageShell({ children }: PageShellProps) {
    return (
        <div className="bg-paper text-ink selection:bg-forest/20 selection:text-forest flex min-h-screen flex-col font-sans">
            <EditorialHeader />

            {/* Content wrapper */}
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>

            {/* Footer */}
            <footer className="border-paper-dark/60 bg-paper mt-auto border-t px-4 py-8 text-center">
                <div className="mx-auto max-w-6xl space-y-2">
                    <p className="text-ink-muted text-xs">&copy; {new Date().getFullYear()} Alma Lectora — Programación de Aplicaciones Web (PAW).</p>
                    <p className="text-[11px] text-stone-400">Reconstrucción monolítica con Laravel 12/13, Inertia.js v2, React 19 y PostgreSQL.</p>
                </div>
            </footer>
        </div>
    );
}

export default PageShell;
