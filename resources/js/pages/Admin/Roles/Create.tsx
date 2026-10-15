import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';

interface PermissionItem {
    id: number;
    name: string;
}

interface CreateRoleProps {
    permissions: PermissionItem[];
}

export default function CreateRole({ permissions }: CreateRoleProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const handleCheckboxChange = (permName: string) => {
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
        post('/admin/roles');
    };

    return (
        <AdminLayout
            title="Crear Nuevo Rol"
            subtitle="Defina un nuevo rol y seleccione los permisos habilitados"
            breadcrumbText="Volver a Roles"
            breadcrumbHref="/admin/roles"
        >
            <Head title="Crear Rol | Alma Lectora Admin" />

            <form onSubmit={handleSubmit} className="bg-paper border-paper-dark/60 max-w-3xl space-y-6 rounded-2xl border p-6 sm:p-8 shadow-xs">
                {/* Nombre del Rol */}
                <div>
                    <label className="text-ink font-serif text-sm font-bold block mb-1">
                        Nombre del Rol <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="ej: supervisor, editor-catalogo"
                        className="border-paper-dark/60 bg-paper-light focus:border-forest focus:ring-forest w-full rounded-xl border px-4 py-2.5 text-sm transition-colors"
                        required
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    <p className="text-ink-muted text-xs mt-1">El nombre se guardará en formato minúsculas para consistencia del sistema.</p>
                </div>

                {/* Selección de Permisos */}
                <div className="border-t border-paper-dark/60 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-ink font-serif text-base font-bold">Permisos Disponibles</h3>
                            <p className="text-ink-muted text-xs">Marque los permisos que tendrá este rol</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="text-xs text-forest hover:underline font-semibold"
                        >
                            {data.permissions.length === permissions.length ? 'Desmarcar todos' : 'Seleccionar todos'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto p-1">
                        {permissions.map((perm) => {
                            const isChecked = data.permissions.includes(perm.name);
                            return (
                                <label
                                    key={perm.id}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                        isChecked
                                            ? 'bg-forest/5 border-forest/30 text-ink'
                                            : 'bg-paper-light/50 border-paper-dark/40 text-ink-muted hover:bg-paper-light'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
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
                        disabled={processing}
                        className="bg-forest text-stone-100 hover:bg-forest-dark disabled:opacity-50 rounded-xl px-6 py-2.5 text-xs font-serif font-bold shadow-xs transition-colors"
                    >
                        {processing ? 'Guardando...' : 'Crear Rol'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
