import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';

interface PermissionItem {
    id: number;
    name: string;
}

interface RoleItem {
    id: number;
    name: string;
}

interface EditRoleProps {
    role: RoleItem;
    rolePermissions: string[];
    permissions: PermissionItem[];
}

export default function EditRole({ role, rolePermissions, permissions }: EditRoleProps) {
    const isSuperAdmin = role.name === 'super-admin';

    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: rolePermissions || [],
    });

    const handleCheckboxChange = (permName: string) => {
        if (isSuperAdmin) return;
        if (data.permissions.includes(permName)) {
            setData(
                'permissions',
                data.permissions.filter((p) => p !== permName)
            );
        } else {
            setData('permissions', [...data.permissions, permName]);
        }
    };

    const handleSelectAll = () => {
        if (isSuperAdmin) return;
        if (data.permissions.length === permissions.length) {
            setData('permissions', []);
        } else {
            setData(
                'permissions',
                permissions.map((p) => p.name)
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/roles/${role.id}`);
    };

    return (
        <AdminLayout
            title={`Editar Rol: ${role.name}`}
            subtitle="Modifique la denominación y los permisos asociados"
            breadcrumbText="Volver a Roles"
            breadcrumbHref="/admin/roles"
        >
            <Head title={`Editar Rol ${role.name} | Alma Lectora Admin`} />

            <form onSubmit={handleSubmit} className="bg-paper border-paper-dark/60 max-w-3xl space-y-6 rounded-2xl border p-6 sm:p-8 shadow-xs">
                {isSuperAdmin && (
                    <div className="bg-purple-50 border border-purple-200 text-purple-900 rounded-xl p-4 text-xs">
                        <p className="font-bold mb-1">Rol Fundamental del Sistema (Super-Admin)</p>
                        <p>Este rol tiene acceso total e irrestricto sobre todas las áreas del sistema. Por seguridad, no es posible renombrarlo ni revocar permisos individuales.</p>
                    </div>
                )}

                {/* Nombre del Rol */}
                <div>
                    <label className="text-ink font-serif text-sm font-bold block mb-1">
                        Nombre del Rol <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        disabled={isSuperAdmin}
                        onChange={(e) => setData('name', e.target.value)}
                        className={`border-paper-dark/60 bg-paper-light focus:border-forest focus:ring-forest w-full rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                            isSuperAdmin ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                        required
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>

                {/* Selección de Permisos */}
                <div className="border-t border-paper-dark/60 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-ink font-serif text-base font-bold">Permisos Asignados</h3>
                            <p className="text-ink-muted text-xs">
                                {isSuperAdmin
                                    ? 'El rol Super-Admin hereda automáticamente todos los permisos'
                                    : 'Marque o desmarque los permisos habilitados para este rol'}
                            </p>
                        </div>
                        {!isSuperAdmin && (
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-xs text-forest hover:underline font-semibold"
                            >
                                {data.permissions.length === permissions.length ? 'Desmarcar todos' : 'Seleccionar todos'}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto p-1">
                        {permissions.map((perm) => {
                            const isChecked = isSuperAdmin || data.permissions.includes(perm.name);
                            return (
                                <label
                                    key={perm.id}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs transition-all ${
                                        isChecked
                                            ? 'bg-forest/5 border-forest/30 text-ink'
                                            : 'bg-paper-light/50 border-paper-dark/40 text-ink-muted hover:bg-paper-light'
                                    } ${isSuperAdmin ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isSuperAdmin}
                                        onChange={() => handleCheckboxChange(perm.name)}
                                        className="text-forest focus:ring-forest rounded mt-0.5"
                                    />
                                    <span className="font-mono">{perm.name}</span>
                                </label>
                            );
                        })}
                    </div>
                    {errors.permissions && <p className="text-xs text-red-600 mt-1">{errors.permissions}</p>}
                </div>

                {/* Botones de acción */}
                <div className="border-t border-paper-dark/60 pt-6 flex items-center justify-end gap-3">
                    <Link
                        href="/admin/roles"
                        className="hover:bg-paper-dark text-ink-muted hover:text-ink rounded-xl px-5 py-2.5 text-xs font-semibold transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={processing || isSuperAdmin}
                        className="bg-forest text-stone-100 hover:bg-forest-dark disabled:opacity-50 rounded-xl px-6 py-2.5 text-xs font-serif font-bold shadow-xs transition-colors"
                    >
                        {processing ? 'Actualizando...' : 'Actualizar Rol'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
