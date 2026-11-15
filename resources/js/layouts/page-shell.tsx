import { usePage } from '@inertiajs/react';
import React from 'react';
import { EditorialHeader } from '../components/layout/editorial-header';
import { InstagramFAB } from '../components/ui/instagram-fab';
import type { SharedData } from '../types';

interface PageShellProps {
    children: React.ReactNode;
}

export function PageShell({ children }: PageShellProps) {
    const { storeConfig } = usePage<SharedData>().props;

    return (
        <div className="bg-paper text-ink selection:bg-forest/20 selection:text-forest flex min-h-screen flex-col font-sans">
            <EditorialHeader />

            {storeConfig && !storeConfig.is_store_open && (
                <div className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-xs font-semibold text-amber-950 shadow-2xs sm:text-sm">
                    <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
                        <span>⚠️</span>
                        <span>
                            En estos momentos las consultas y pedidos por WhatsApp están cerrados temporalmente.
                        </span>
                    </div>
                </div>
            )}

            {/* Content wrapper */}
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>

            {/* Footer */}
            <footer className="border-paper-dark/60 bg-paper mt-auto border-t px-4 py-8 text-center">
                <div className="mx-auto max-w-6xl">
                    <p className="text-ink-muted text-xs">&copy; {new Date().getFullYear()} Alma Lectora — Programación de Aplicaciones Web (PAW).</p>
                </div>
            </footer>

            <InstagramFAB />
        </div>
    );
}

export default PageShell;
