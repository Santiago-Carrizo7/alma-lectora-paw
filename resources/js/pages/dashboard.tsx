import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageShell } from '@/layouts/page-shell';

export default function Dashboard() {
    const page = usePage();
    const user = (page.props as any)?.auth?.user;

    return (
        <PageShell>
            <Head title="Mi Cuenta - Alma Lectora" />
            <div className="space-y-6 max-w-4xl mx-auto animate-fade-in py-4">
                <div className="bg-paper-dark/40 rounded-2xl p-6 sm:p-8 border border-paper-dark/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest bg-forest/10 px-2.5 py-1 rounded-full">
                        {user?.role === 'admin' ? 'Administrador' : 'Lector'}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink mt-2">
                        ¡Hola, {user?.name || 'Lector'}!
                    </h1>
                    <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
                        Bienvenido a tu espacio personal en Alma Lectora.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        href="/libros"
                        className="p-6 rounded-2xl border border-paper-dark bg-paper hover:border-forest/40 hover:shadow-xs transition-all group"
                    >
                        <h3 className="font-bold font-serif text-ink text-base group-hover:text-forest transition-colors">
                            Explorar Catálogo &rarr;
                        </h3>
                        <p className="text-xs text-ink-muted mt-1">
                            Descubre novedades, clásicos y títulos recomendados.
                        </p>
                    </Link>

                    {user?.role === 'admin' ? (
                        <Link
                            href="/admin"
                            className="p-6 rounded-2xl border border-forest/30 bg-forest/5 hover:bg-forest/10 hover:shadow-xs transition-all group"
                        >
                            <h3 className="font-bold font-serif text-forest text-base">
                                Panel de Administración &rarr;
                            </h3>
                            <p className="text-xs text-ink-muted mt-1">
                                Gestionar inventario, catálogo de libros y pedidos.
                            </p>
                        </Link>
                    ) : (
                        <Link
                            href="/settings/profile"
                            className="p-6 rounded-2xl border border-paper-dark bg-paper hover:border-forest/40 hover:shadow-xs transition-all group"
                        >
                            <h3 className="font-bold font-serif text-ink text-base group-hover:text-forest transition-colors">
                                Mi Perfil &rarr;
                            </h3>
                            <p className="text-xs text-ink-muted mt-1">
                                Actualizar datos personales y contraseña.
                            </p>
                        </Link>
                    )}
                </div>
            </div>
        </PageShell>
    );
}
