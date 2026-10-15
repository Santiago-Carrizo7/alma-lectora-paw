import { Head, Link, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';

interface RoleRef {
    id: number;
    name: string;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    roles: RoleRef[];
}

interface PaginatedUsers {
    data: UserItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface UsersIndexProps {
    users: PaginatedUsers;
    filters: {
        search?: string;
    };
    availableRoles: string[];
}

export default function UsersIndex({ users, filters }: UsersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/admin/usuarios', { search }, { preserveState: true, replace: true });
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const handleDelete = (user: UserItem) => {
        if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${user.name}" (${user.email})?`)) {
            router.delete(`/admin/usuarios/${user.id}`);
        }
    };

    return (
        <AdminLayout
            title="Gestión de Usuarios"
            subtitle="Administración de cuentas, credenciales y asignación de roles del sistema"
            action={
                <Link
                    href="/admin/usuarios/create"
                    className="bg-forest text-stone-100 hover:bg-forest-dark flex items-center justify-center rounded-xl px-4 py-2 text-xs font-serif font-bold shadow-xs transition-colors"
                >
                    + Nuevo Usuario
                </Link>
            }
        >
            <Head title="Gestión de Usuarios | Alma Lectora Admin" />

            <div className="space-y-6">
                {/* Barra de Búsqueda */}
                <div className="bg-paper border-paper-dark/60 rounded-2xl border p-4 shadow-xs flex items-center gap-3">
                    <svg className="w-4 h-4 text-ink-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o correo electrónico..."
                        className="bg-transparent border-none text-xs text-ink placeholder:text-ink-muted focus:outline-none w-full"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="text-xs text-ink-muted hover:text-ink font-semibold"
                        >
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Tabla de Usuarios */}
                <div className="bg-paper border-paper-dark/60 overflow-hidden rounded-2xl border shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="divide-paper-dark/60 w-full divide-y text-left text-sm">
                            <thead className="bg-paper-light text-ink font-serif text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Roles Asignados</th>
                                    <th className="px-6 py-4 text-center">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-paper-dark/40 divide-y">
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-paper-light/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-ink">{user.name}</p>
                                                    <p className="text-ink-muted text-xs font-mono">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {user.roles && user.roles.length > 0 ? (
                                                        user.roles.map((r) => (
                                                            <span
                                                                key={r.id}
                                                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                                                    r.name === 'super-admin'
                                                                        ? 'bg-purple-100 text-purple-900 border-purple-200'
                                                                        : r.name === 'admin'
                                                                        ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                                                                        : 'bg-stone-100 text-stone-800 border-stone-200'
                                                                }`}
                                                            >
                                                                {r.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-stone-400 italic">Sin roles</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        user.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/usuarios/${user.id}`}
                                                        className="hover:bg-paper-dark text-ink-muted hover:text-ink rounded-lg p-1.5 transition-colors"
                                                        title="Ver ficha de usuario"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                        </svg>
                                                    </Link>
                                                    <Link
                                                        href={`/admin/usuarios/${user.id}/edit`}
                                                        className="hover:bg-paper-dark text-forest hover:text-forest-dark rounded-lg p-1.5 transition-colors"
                                                        title="Editar usuario y roles"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(user)}
                                                        className="hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg p-1.5 transition-colors"
                                                        title="Eliminar usuario"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-ink-muted text-xs">
                                            No se encontraron usuarios coincidentes con la búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {users.last_page > 1 && (
                        <div className="bg-paper-light border-paper-dark/60 border-t px-6 py-4 flex items-center justify-between">
                            <span className="text-xs text-ink-muted">
                                Mostrando página {users.current_page} de {users.last_page} ({users.total} usuarios en total)
                            </span>
                            <div className="flex gap-1">
                                {users.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                            link.active
                                                ? 'bg-forest text-stone-100 font-bold'
                                                : link.url
                                                ? 'hover:bg-paper-dark text-ink'
                                                : 'text-stone-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
