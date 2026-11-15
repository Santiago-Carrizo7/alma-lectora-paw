import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';

interface PermissionItem {
    id: number;
    name: string;
    guard_name?: string;
    created_at?: string;
}

interface RoleItem {
    id: number;
    name: string;
    guard_name: string;
    permissions: PermissionItem[];
}

interface RolesIndexProps {
    roles: RoleItem[];
    permissions?: PermissionItem[];
}

function classifyPermissionModule(permName: string): string {
    const lower = permName.toLowerCase();
    if (lower.includes('libro')) return '📚 Libros';
    if (lower.includes('accesorio')) return '🕯️ Accesorios';
    if (lower.includes('combo')) return '🎁 Combos';
    if (lower.includes('pedido') || lower.includes('remito')) return '📦 Pedidos';
    if (lower.includes('configuracion') || lower.includes('categoria') || lower.includes('genero')) return '⚙️ Configuración';
    if (lower.includes('reporte') || lower.includes('estadistic')) return '📊 Reportes';
    if (lower.includes('usuario') || lower.includes('rol') || lower.includes('permiso')) return '🔐 Usuarios y Seguridad';
    return '🧩 Otros Permisos';
}

export default function RolesIndex({ roles, permissions = [] }: RolesIndexProps) {
    const [permSearch, setPermSearch] = useState('');
    const [isCreatePermOpen, setIsCreatePermOpen] = useState(false);
    const [deletingRole, setDeletingRole] = useState<RoleItem | null>(null);
    const [deletingPermission, setDeletingPermission] = useState<PermissionItem | null>(null);
    const [isProcessingDelete, setIsProcessingDelete] = useState(false);

    const createPermForm = useForm({
        name: '',
        guard_name: 'web',
    });

    const isSystemRole = (name: string) => ['super-admin', 'admin', 'client', 'guest'].includes(name.toLowerCase());

    const groupedPermissions = useMemo(() => {
        const term = permSearch.trim().toLowerCase();
        const filtered = term
            ? permissions.filter((p) => p.name.toLowerCase().includes(term))
            : permissions;

        const groups: Record<string, PermissionItem[]> = {};
        for (const perm of filtered) {
            const group = classifyPermissionModule(perm.name);
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(perm);
        }
        return groups;
    }, [permissions, permSearch]);

    const handleCreatePermission = (e: React.FormEvent) => {
        e.preventDefault();
        createPermForm.post('/admin/permisos', {
            preserveScroll: true,
            onSuccess: () => {
                createPermForm.reset();
                setIsCreatePermOpen(false);
            },
        });
    };

    const handleConfirmDeleteRole = () => {
        if (!deletingRole) return;
        setIsProcessingDelete(true);
        router.delete(`/admin/roles/${deletingRole.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingRole(null);
                setIsProcessingDelete(false);
            },
            onError: () => setIsProcessingDelete(false),
        });
    };

    const handleConfirmDeletePermission = () => {
        if (!deletingPermission) return;
        setIsProcessingDelete(true);
        router.delete(`/admin/permisos/${deletingPermission.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingPermission(null);
                setIsProcessingDelete(false);
            },
            onError: () => setIsProcessingDelete(false),
        });
    };

    return (
        <AdminLayout
            title="Gestión de Roles y Permisos"
            subtitle="Administración de perfiles de acceso, asignación de capacidades y catálogo de permisos RBAC"
            action={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            createPermForm.reset();
                            createPermForm.clearErrors();
                            setIsCreatePermOpen(true);
                        }}
                        className="border-forest/40 text-forest hover:bg-forest/10 bg-paper flex cursor-pointer items-center justify-center rounded-xl border px-4 py-2 text-xs font-serif font-bold shadow-xs transition-colors"
                    >
                        + Nuevo Permiso
                    </button>
                    <Link
                        href="/admin/roles/create"
                        className="bg-forest text-stone-100 hover:bg-forest-dark flex items-center justify-center rounded-xl px-4 py-2 text-xs font-serif font-bold shadow-xs transition-colors"
                    >
                        + Nuevo Rol
                    </Link>
                </div>
            }
        >
            <Head title="Gestión de Roles y Permisos | Alma Lectora Admin" />

            <div className="space-y-8 pb-10">
                {/* SECCIÓN 1: Tabla de Roles del Sistema */}
                <div className="space-y-3">
                    <div>
                        <h2 className="text-ink font-serif text-lg font-bold">Perfiles y Roles del Sistema</h2>
                        <p className="text-ink-muted text-xs">
                            Los roles agrupan permisos que luego se asignan a cada usuario. Los roles base del sistema están protegidos contra eliminación.
                        </p>
                    </div>

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
                                                        Todos los permisos ({permissions.length || role.permissions?.length || 'Heredados'})
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
                                                            onClick={() => setDeletingRole(role)}
                                                            className="hover:bg-red-50 text-red-500 hover:text-red-700 cursor-pointer rounded-lg p-1.5 transition-colors"
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
                </div>

                {/* SECCIÓN 2: Catálogo y Control de Permisos */}
                <div className="border-paper-dark/80 space-y-4 border-t pt-6">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-ink font-serif text-lg font-bold">
                                Catálogo de Permisos ({permissions.length})
                            </h2>
                            <p className="text-ink-muted text-xs">
                                Habilidades granulares organizadas por módulo. Podés crear, renombrar o eliminar permisos directamente desde aquí.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    value={permSearch}
                                    onChange={(e) => setPermSearch(e.target.value)}
                                    placeholder="Buscar permiso..."
                                    className="bg-paper border-stone-300 text-ink focus:border-forest w-full rounded-xl border py-2 pr-3 pl-8 text-xs shadow-2xs focus:outline-none"
                                />
                                <svg
                                    className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-stone-400"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    createPermForm.reset();
                                    createPermForm.clearErrors();
                                    setIsCreatePermOpen(true);
                                }}
                                className="bg-forest hover:bg-forest-light shrink-0 cursor-pointer rounded-xl px-3.5 py-2 font-serif text-xs font-bold text-white shadow-xs transition-colors"
                            >
                                + Crear Permiso
                            </button>
                        </div>
                    </div>

                    {Object.keys(groupedPermissions).length === 0 ? (
                        <div className="bg-paper border-paper-dark/60 text-ink-muted rounded-2xl border p-8 text-center text-xs">
                            No se encontraron permisos que coincidan con "{permSearch}".
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {Object.entries(groupedPermissions).map(([moduleName, modulePerms]) => (
                                <div
                                    key={moduleName}
                                    className="bg-paper border-paper-dark/60 flex flex-col justify-between space-y-3 rounded-2xl border p-5 shadow-xs"
                                >
                                    <div className="space-y-3">
                                        <div className="border-paper-dark/60 flex items-center justify-between border-b pb-2">
                                            <h3 className="text-ink font-serif text-sm font-bold">{moduleName}</h3>
                                            <span className="bg-paper-dark text-ink-muted rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
                                                {modulePerms.length}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {modulePerms.map((perm) => (
                                                <div
                                                    key={perm.id}
                                                    className="bg-paper-dark/30 border-stone-200 hover:border-forest/40 group inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-all"
                                                >
                                                    <span className="text-ink font-mono text-xs font-medium">{perm.name}</span>
                                                    <div className="border-stone-200 flex items-center border-l pl-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingPermission(perm)}
                                                            className="text-stone-400 hover:text-red-600 cursor-pointer rounded p-0.5 transition-colors"
                                                            title={`Eliminar permiso "${perm.name}"`}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal 1: Crear Permiso */}
            {isCreatePermOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs animate-fade-in">
                    <form
                        onSubmit={handleCreatePermission}
                        className="bg-paper border-paper-dark w-full max-w-md space-y-4 rounded-2xl border p-6 shadow-2xl"
                    >
                        <h3 className="text-ink font-serif text-lg font-bold">Registrar Nuevo Permiso</h3>
                        <p className="text-ink-muted text-xs">
                            El nuevo permiso se asignará automáticamente al rol <code className="font-mono font-bold">super-admin</code> y estará disponible para asignarse a otros roles.
                        </p>

                        <div className="rounded-xl border border-stone-200 bg-paper-dark/30 p-3 text-[11px] text-stone-600 space-y-1">
                            <strong className="text-ink block">💡 Sugerencia de formato para la clasificación automática:</strong>
                            <p>
                                Se sugiere poner el prefijo de la sección donde lo querés ubicar, por ejemplo:
                            </p>
                            <ul className="list-disc pl-4 font-mono text-[10px] text-forest space-y-0.5">
                                <li>pedidos: despachar</li>
                                <li>libros: exportar</li>
                                <li>reportes: auditar métricas</li>
                            </ul>
                        </div>

                        <div>
                            <label className="text-ink mb-1 block text-xs font-bold uppercase tracking-wider">
                                Nombre del Permiso *
                            </label>
                            <input
                                type="text"
                                required
                                autoFocus
                                value={createPermForm.data.name}
                                onChange={(e) => createPermForm.setData('name', e.target.value)}
                                placeholder="Ej: pedidos: despachar"
                                className="bg-paper-light border-paper-dark focus:border-forest text-ink w-full rounded-xl border px-3.5 py-2.5 font-mono text-xs focus:outline-none"
                            />
                            {createPermForm.errors.name && (
                                <p className="mt-1 text-xs text-red-600">{createPermForm.errors.name}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsCreatePermOpen(false)}
                                disabled={createPermForm.processing}
                                className="border-stone-300 text-ink hover:bg-paper-dark cursor-pointer rounded-xl border px-4 py-2 text-xs font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={createPermForm.processing || !createPermForm.data.name.trim()}
                                className="bg-forest hover:bg-forest-light cursor-pointer rounded-xl px-4 py-2 font-serif text-xs font-bold text-white transition-colors disabled:opacity-50"
                            >
                                {createPermForm.processing ? 'Guardando...' : 'Crear Permiso'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Modal 3A: Confirmar Eliminación de Rol */}
            {deletingRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-paper border-paper-dark w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-2xl">
                        <h3 className="text-ink font-serif text-lg font-bold">¿Eliminar rol personalizado?</h3>
                        <p className="text-ink-muted text-xs leading-relaxed">
                            Se eliminará el rol <strong className="text-ink">"{deletingRole.name}"</strong> del sistema. Los usuarios que lo tuvieran asignado perderán los permisos otorgados exclusivamente por este rol.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingRole(null)}
                                disabled={isProcessingDelete}
                                className="border-stone-300 text-ink hover:bg-paper-dark cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDeleteRole}
                                disabled={isProcessingDelete}
                                className="bg-red-600 hover:bg-red-700 cursor-pointer rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors disabled:opacity-50"
                            >
                                {isProcessingDelete ? 'Eliminando...' : 'Eliminar Rol'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal 3B: Confirmar Eliminación de Permiso */}
            {deletingPermission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-paper border-paper-dark w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-2xl">
                        <h3 className="text-ink font-serif text-lg font-bold">¿Eliminar permiso?</h3>
                        <p className="text-ink-muted text-xs leading-relaxed">
                            Se eliminará el permiso <strong className="text-ink">"{deletingPermission.name}"</strong> y se desvinculará de todos los roles que lo tengan asignado.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingPermission(null)}
                                disabled={isProcessingDelete}
                                className="border-stone-300 text-ink hover:bg-paper-dark cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDeletePermission}
                                disabled={isProcessingDelete}
                                className="bg-red-600 hover:bg-red-700 cursor-pointer rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors disabled:opacity-50"
                            >
                                {isProcessingDelete ? 'Eliminando...' : 'Eliminar Permiso'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
