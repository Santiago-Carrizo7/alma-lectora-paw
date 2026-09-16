import { PageShell } from '@/layouts/page-shell';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { props } = usePage<SharedData>();
    const user = props.auth?.user;

    return (
        <PageShell>
            <Head title="Mi Cuenta - Alma Lectora" />
            <div className="animate-fade-in mx-auto max-w-4xl space-y-6 py-4">
                <div className="bg-paper-dark/40 border-paper-dark/80 rounded-2xl border p-6 sm:p-8">
                    <span className="text-forest bg-forest/10 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase">
                        {user?.role === 'admin' ? 'Administrador' : 'Lector'}
                    </span>
                    <h1 className="text-ink mt-2 font-serif text-2xl font-bold sm:text-3xl">¡Hola, {user?.name || 'Lector'}!</h1>
                    <p className="text-ink-muted mt-1 text-xs leading-relaxed sm:text-sm">Bienvenido a tu espacio personal en Alma Lectora.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link
                        href="/libros"
                        className="border-paper-dark bg-paper hover:border-forest/40 group rounded-2xl border p-6 transition-all hover:shadow-xs"
                    >
                        <h3 className="text-ink group-hover:text-forest font-serif text-base font-bold transition-colors">
                            Explorar Catálogo &rarr;
                        </h3>
                        <p className="text-ink-muted mt-1 text-xs">Descubre novedades, clásicos y títulos recomendados.</p>
                    </Link>

                    {user?.role === 'admin' ? (
                        <Link
                            href="/admin"
                            className="border-forest/30 bg-forest/5 hover:bg-forest/10 group rounded-2xl border p-6 transition-all hover:shadow-xs"
                        >
                            <h3 className="text-forest font-serif text-base font-bold">Panel de Administración &rarr;</h3>
                            <p className="text-ink-muted mt-1 text-xs">Gestionar inventario, catálogo de libros y pedidos.</p>
                        </Link>
                    ) : (
                        <Link
                            href="/settings/profile"
                            className="border-paper-dark bg-paper hover:border-forest/40 group rounded-2xl border p-6 transition-all hover:shadow-xs"
                        >
                            <h3 className="text-ink group-hover:text-forest font-serif text-base font-bold transition-colors">Mi Perfil &rarr;</h3>
                            <p className="text-ink-muted mt-1 text-xs">Actualizar datos personales y contraseña.</p>
                        </Link>
                    )}
                </div>
            </div>
        </PageShell>
    );
}
