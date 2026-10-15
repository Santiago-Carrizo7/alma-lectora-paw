import { Head, Link } from '@inertiajs/react';
import { AdminLayout } from '../../../layouts/admin-layout';

interface PermissionItem {
    id: number;
    name: string;
}

interface RoleItem {
    id: number;
    name: string;
    guard_name: string;
    created_at?: string;
    permissions: PermissionItem[];
}

interface ShowRoleProps {
    role: RoleItem;
}

export default function ShowRole({ role }: ShowRoleProps) {
    return (
        <AdminLayout
            title={`Detalle de Rol: ${role.name}`}
            subtitle="Permisos y configuración del perfil"
            breadcrumbText="Volver a Roles"
            breadcrumbHref="/admin/roles"
            action={
                <Link
                    href={`/admin/roles/${role.id}/edit`}
                    className="bg-forest text-stone-100 hover:bg-forest-dark flex items-center justify-center rounded-xl px-4 py-2 text-xs font-serif font-bold shadow-xs transition-colors"
                >
                    Editar Rol
                </Link>
            }
        >
            <Head title={`Rol ${role.name} | Alma Lectora Admin`} />

            <div className="bg-paper border-paper-dark/60 max-w-3xl space-y-6 rounded-2xl border p-6 sm:p-8 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-paper-dark/60">
                    <div>
                        <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Identificador</span>
                        <p className="text-ink font-serif text-xl font-bold capitalize mt-0.5">{role.name}</p>
                    </div>
                    <div>
                        <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Guard de Seguridad</span>
                        <p className="text-ink font-mono text-sm mt-0.5">{role.guard_name}</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-ink font-serif text-base font-bold mb-3">
                        Permisos Concedidos ({role.permissions?.length || 0})
                    </h3>

                    {role.permissions && role.permissions.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {role.permissions.map((p) => (
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
                        <p className="text-xs text-ink-muted italic">Este rol no cuenta con permisos directos asignados.</p>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
