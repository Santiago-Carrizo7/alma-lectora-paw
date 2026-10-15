import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';

interface PermissionItem {
    id: number;
    name: string;
}

interface RoleItem {
    id: number;
    name: string;
    guard_name: string;
    permissions: PermissionItem[];
}

interface RolesIndexProps {
    roles: RoleItem[];
}

export default function RolesIndex({ roles }: RolesIndexProps) {
    const [deletingRole, setDeletingRole] = useState<RoleItem | null>(null);

    const handleDelete = (role: RoleItem) => {
        if (confirm(`¿Estás seguro de que deseas eliminar el rol "${role.name}"?`)) {
            router.delete(`/admin/roles/${role.id}`);
        }
    };

    const isSystemRole = (name: string) => ['super-admin', 'admin', 'client', 'guest'].includes(name);

    return (
        <AdminLayout
            title="Gestión de Roles"
            subtitle="Administración de perfiles y capacidades del sistema"
            action={
                <Link
                    href="/admin/roles/create"
                    className="bg-forest text-stone-100 hover:bg-forest-dark flex items-center justify-center rounded-xl px-4 py-2 text-xs font-serif font-bold shadow-xs transition-colors"
                >
                    + Nuevo Rol
                </Link>
            }
        >
            <Head title="Gestión de Roles | Alma Lectora Admin" />

            <div className="bg-paper border-paper-dark/60 overflow-hidden rounded-2xl border shadow-xs">
                <div className="overflow-x-auto">
                    <table className="divide-paper-dark/60 w-full divide-y text-left text-sm">
                        <thead className="bg-paper-light text-ink font-serif text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Nombre del Rol</th>
                                <th className="px-6 py-4">Permisos Asignados</th>
                                <th className="px-6 py-4 text-center">Tipo</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-paper-dark/40 divide-y">
                            {roles.map((role) => (
                                <tr key={role.id} className="hover:bg-paper-light/50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-ink">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm capitalize">{role.name}</span>
                                            {role.name === 'super-admin' && (
                                                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    Control Total
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-ink-muted">
                                        {role.name === 'super-admin' ? (
                                            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                                                Todos los permisos (Heredados)
                                            </span>
                                        ) : role.permissions && role.permissions.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5 max-w-md">
                                                {role.permissions.slice(0, 4).map((p) => (
                                                    <span
                                                        key={p.id}
                                                        className="bg-stone-100 border border-stone-200 text-stone-700 text-[11px] px-2 py-0.5 rounded-md"
                                                    >
                                                        {p.name}
                                                    </span>
                                                ))}
                                                {role.permissions.length > 4 && (
                                                    <span className="text-xs text-ink-muted font-medium self-center">
                                                        +{role.permissions.length - 4} más...
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-stone-400 italic">Sin permisos directos</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {isSystemRole(role.name) ? (
                                            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                                Sistema
                                            </span>
                                        ) : (
                                            <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                                Personalizado
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/roles/${role.id}`}
                                                className="hover:bg-paper-dark text-ink-muted hover:text-ink rounded-lg p-1.5 transition-colors"
                                                title="Ver detalle"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            </Link>
                                            <Link
                                                href={`/admin/roles/${role.id}/edit`}
                                                className="hover:bg-paper-dark text-forest hover:text-forest-dark rounded-lg p-1.5 transition-colors"
                                                title="Editar rol y permisos"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                                </svg>
                                            </Link>
                                            {!isSystemRole(role.name) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(role)}
                                                    className="hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg p-1.5 transition-colors"
                                                    title="Eliminar rol"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
