import type { SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { useCart } from '../../lib/cart-store';
import { CartDrawer } from '../cart/cart-drawer';

export function EditorialHeader() {
    const { props, url } = usePage<SharedData>();
    const user = props.auth?.user;
    const isAdminRoute = url.startsWith('/admin');
    const { openCart, totalItems } = useCart();

    return (
        <header className="bg-paper/95 border-paper-dark/60 sticky top-0 z-40 border-b px-4 pt-3 pb-2 backdrop-blur-md sm:px-6 sm:py-4">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
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

                <nav className="text-ink-muted hidden items-center gap-8 text-xs font-bold tracking-wider uppercase sm:flex">
                    <Link
                        href="/libros"
                        className={`transition-colors pb-1 border-b-2 ${
                            url.startsWith('/libros')
                                ? 'text-forest border-forest'
                                : 'border-transparent hover:text-forest'
                        }`}
                    >
                        Libros
                    </Link>
                    <Link
                        href="/accesorios"
                        className={`transition-colors pb-1 border-b-2 ${
                            url.startsWith('/accesorios')
                                ? 'text-forest border-forest'
                                : 'border-transparent hover:text-forest'
                        }`}
                    >
                        Accesorios
                    </Link>
                </nav>

                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        type="button"
                        onClick={openCart}
                        className="hover:bg-paper-dark text-ink hover:text-forest relative rounded-full p-2 transition-all duration-200 cursor-pointer"
                        aria-label={`Ver carrito (${totalItems} ${totalItems === 1 ? 'producto' : 'productos'})`}
                        title="Ver carrito de compras"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {totalItems > 0 && (
                            <span className="bg-forest text-stone-100 absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 font-mono text-[10px] font-bold shadow-xs">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-ink-muted hidden text-xs font-medium md:inline-block">{user.name}</span>
                            {user.role === 'admin' && (
                                <Link
                                    href="/admin"
                                    className="border-forest/30 text-forest hover:bg-forest/10 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
                                >
                                    <svg className="text-forest h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                    </svg>
                                    <span>Panel Admin</span>
                                </Link>
                            )}
                            <button
                                type="button"
                                onClick={() => router.post('/logout')}
                                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                            >
                                Cerrar Sesión
                            </button>
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

            {!isAdminRoute && (
                <nav
                    aria-label="Navegación móvil"
                    className="border-paper-dark/60 -mb-1 mt-2.5 flex items-center justify-around border-t pt-1.5 text-xs sm:hidden"
                >
                    <Link
                        href="/"
                        className={`flex-1 py-1 text-center tracking-wide transition-all duration-200 ${
                            url === '/'
                                ? 'text-forest border-forest border-b-2 pb-1 font-bold'
                                : 'hover:text-ink border-b-2 border-transparent pb-1 font-medium text-stone-500'
                        }`}
                    >
                        Inicio
                    </Link>
                    <Link
                        href="/libros"
                        className={`flex-1 py-1 text-center tracking-wide transition-all duration-200 ${
                            url.startsWith('/libros')
                                ? 'text-forest border-forest border-b-2 pb-1 font-bold'
                                : 'hover:text-ink border-b-2 border-transparent pb-1 font-medium text-stone-500'
                        }`}
                    >
                        Libros
                    </Link>
                    <Link
                        href="/accesorios"
                        className={`flex-1 py-1 text-center tracking-wide transition-all duration-200 ${
                            url.startsWith('/accesorios')
                                ? 'text-forest border-forest border-b-2 pb-1 font-bold'
                                : 'hover:text-ink border-b-2 border-transparent pb-1 font-medium text-stone-500'
                        }`}
                    >
                        Accesorios
                    </Link>
                </nav>
            )}

            <CartDrawer />
        </header>
    );
}

export default EditorialHeader;
