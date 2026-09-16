import type { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function EditorialHeader() {
    const { props, url } = usePage<SharedData>();
    const user = props.auth?.user;

    return (
        <header className="bg-paper/90 border-paper-dark/60 sticky top-0 z-40 border-b px-4 py-4 backdrop-blur-md sm:px-6">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
                {/* Brand Logo */}
                <Link href="/" className="group flex items-center gap-2">
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
                    <span className="text-ink font-serif text-xl font-bold tracking-tight">Alma Lectora</span>
                </Link>

                <nav className="text-ink-muted flex items-center gap-6 text-sm font-bold">
                    <Link
                        href="/libros"
                        className={`text-xs font-semibold tracking-wider uppercase transition-colors ${
                            url.startsWith('/libros') ? 'text-forest border-forest border-b-2 pb-0.5 font-bold' : 'hover:text-forest'
                        }`}
                    >
                        Libros
                    </Link>
                    <Link
                        href="/accesorios"
                        className={`text-xs font-semibold tracking-wider uppercase transition-colors ${
                            url.startsWith('/accesorios') ? 'text-forest border-forest border-b-2 pb-0.5 font-bold' : 'hover:text-forest'
                        }`}
                    >
                        Accesorios
                    </Link>
                </nav>

                {/* Action Controls */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-ink-muted hidden text-xs font-medium sm:inline-block">{user.name}</span>
                            <Link
                                href={user.role === 'admin' ? '/admin' : '/dashboard'}
                                className="border-forest/30 text-forest hover:bg-forest/10 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                            >
                                {user.role === 'admin' ? 'Panel Admin' : 'Dashboard'}
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="hover:bg-paper-dark text-ink hover:text-forest rounded-full p-2 transition-all duration-200"
                            aria-label="Iniciar Sesión"
                            title="Iniciar Sesión"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                />
                            </svg>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default EditorialHeader;
