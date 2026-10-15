import { Head, Link } from '@inertiajs/react';
import { AdminLayout } from '../../../layouts/admin-layout';

interface RoleRef {
    id: number;
    name: string;
}

interface PermissionRef {
    id: number;
    name: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    roles: RoleRef[];
}

interface ShowUserProps {
    user: UserData;
    permissions: PermissionRef[];
}

export default function ShowUser({ user, permissions }: ShowUserProps) {
    return (
        <AdminLayout
            title={`Ficha de Usuario: ${user.name}`}
            subtitle="Detalle de identidad, roles asignados y capacidades heredadas"
            breadcrumbText="Volver a Usuarios"
            breadcrumbHref="/admin/usuarios"
            action={
                <Link
                    href={`/admin/usuarios/${user.id}/edit`}
                    className="bg-forest text-stone-100 hover:bg-forest-dark flex items-center justify-center rounded-xl px-4 py-2 text-xs font-serif font-bold shadow-xs transition-colors"
                >
                    Editar Usuario
                </Link>
            }
        >
            <Head title={`Usuario ${user.name} | Alma Lectora Admin`} />

            <div className="bg-paper border-paper-dark/60 max-w-3xl space-y-6 rounded-2xl border p-6 sm:p-8 shadow-xs">
                {/* Datos de Identidad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-paper-dark/60">
                    <div>
                        <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Nombre Completo</span>
                        <p className="text-ink font-serif text-lg font-bold mt-0.5">{user.name}</p>
                    </div>

                    <div>
                        <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Correo Electrónico</span>
                        <p className="text-ink font-mono text-sm mt-0.5">{user.email}</p>
                    </div>

                    <div>
                        <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Estado de Cuenta</span>
                        <div className="mt-1">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.is_active
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {user.is_active ? 'Cuenta Activa' : 'Cuenta Suspendida'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Roles Asignados</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            {user.roles && user.roles.length > 0 ? (
                                user.roles.map((r) => (
                                    <span
                                        key={r.id}
                                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
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
                                <span className="text-xs text-stone-400 italic">Sin roles asignados</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Permisos Heredados a través de Roles */}
                <div>
                    <h3 className="text-ink font-serif text-base font-bold mb-1">
                        Permisos Efectivos ({permissions?.length || 0})
                    </h3>
                    <p className="text-ink-muted text-xs mb-4">
                        Habilidades y permisos que este usuario hereda de forma consolidada a través de sus roles asignados.
                    </p>

                    {permissions && permissions.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {permissions.map((p) => (
                                <div
                                    key={p.id}
                                    className="bg-paper-light border border-paper-dark/60 rounded-xl px-3 py-2 text-xs font-mono text-ink flex items-center gap-2"
                                >
                                    <svg className="w-3.5 h-3.5 text-forest shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    <span className="truncate">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-ink-muted italic">Este usuario no cuenta con permisos efectivos en el sistema.</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
