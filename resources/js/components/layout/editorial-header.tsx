import { Link, usePage } from '@inertiajs/react';

export function EditorialHeader() {
  const page = usePage();
  const user = (page.props as any)?.auth?.user;

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-paper-dark/60 py-4 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2">
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
          <span className="text-xl font-bold font-serif text-ink tracking-tight">Alma Lectora</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6 text-sm font-bold text-ink-muted">
          <Link
            href="/libros"
            className="hover:text-forest transition-colors uppercase tracking-wider text-xs font-semibold"
          >
            Catálogo de Libros
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-ink-muted hidden sm:inline-block">
                {user.name}
              </span>
              <Link
                href={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-forest/30 text-forest hover:bg-forest/10 transition-colors"
              >
                {user.role === 'admin' ? 'Panel Admin' : 'Dashboard'}
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="p-2 rounded-full hover:bg-paper-dark text-ink hover:text-forest transition-all duration-200"
              aria-label="Iniciar Sesión"
              title="Iniciar Sesión"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
