import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';

interface PermissionItem {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
}

interface PermissionsIndexProps {
    permissions: PermissionItem[];
}

export default function PermissionsIndex({ permissions }: PermissionsIndexProps) {
    const [editingPermission, setEditingPermission] = useState<PermissionItem | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Formulario para crear
    const createForm = useForm({
        name: '',
        guard_name: 'web',
    });

    // Formulario para editar
    const editForm = useForm({
        name: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/permisos', {
            onSuccess: () => {
                createForm.reset();
                setIsCreating(false);
            },
        });
    };

    const handleStartEdit = (perm: PermissionItem) => {
        setEditingPermission(perm);
        editForm.setData('name', perm.name);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPermission) return;
        editForm.put(`/admin/permisos/${editingPermission.id}`, {
            onSuccess: () => {
                setEditingPermission(null);
            },
        });
    };

    const handleDelete = (perm: PermissionItem) => {
        if (confirm(`¿Estás seguro de eliminar el permiso "${perm.name}"? Esta acción afectará a todos los roles que lo tengan asignado.`)) {
            router.delete(`/admin/permisos/${perm.id}`);
        }
    };

    return (
        <AdminLayout
            title="Gestión de Permisos"
            subtitle="Habilidades específicas del sistema verificadas por políticas y middlewares"
            action={
                <button
                    type="button"
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-forest text-stone-100 hover:bg-forest-dark flex items-center justify-center rounded-xl px-4 py-2 text-xs font-serif font-bold shadow-xs transition-colors"
                >
                    {isCreating ? 'Cerrar Formulario' : '+ Nuevo Permiso'}
                </button>
            }
        >
            <Head title="Gestión de Permisos | Alma Lectora Admin" />

            <div className="space-y-6">
                {/* Formulario Reactivo de Creación en Línea */}
                {isCreating && (
                    <form
                        onSubmit={handleCreateSubmit}
                        className="bg-paper border-paper-dark/60 rounded-2xl border p-5 shadow-xs animate-fade-in"
                    >
                        <h3 className="text-ink font-serif text-sm font-bold mb-3">Registrar Nuevo Permiso</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="Nombre del permiso (ej: exportar remitos, auditar pedidos)"
                                    className="border-paper-dark/60 bg-paper-light focus:border-forest focus:ring-forest w-full rounded-xl border px-4 py-2 text-xs transition-colors font-mono"
                                    required
                                />
                                {createForm.errors.name && (
                                    <p className="text-xs text-red-600 mt-1">{createForm.errors.name}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-forest text-stone-100 hover:bg-forest-dark disabled:opacity-50 rounded-xl px-5 py-2 text-xs font-serif font-bold transition-colors shrink-0"
                            >
                                {createForm.processing ? 'Guardando...' : 'Guardar Permiso'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Tabla de Permisos */}
                <div className="bg-paper border-paper-dark/60 overflow-hidden rounded-2xl border shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="divide-paper-dark/60 w-full divide-y text-left text-sm">
                            <thead className="bg-paper-light text-ink font-serif text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Nombre del Permiso</th>
                                    <th className="px-6 py-4">Guard</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-paper-dark/40 divide-y">
                                {permissions.map((perm) => (
                                    <tr key={perm.id} className="hover:bg-paper-light/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {editingPermission?.id === perm.id ? (
                                                <form onSubmit={handleEditSubmit} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editForm.data.name}
                                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                                        className="border-paper-dark/60 bg-white focus:border-forest focus:ring-forest rounded-lg border px-3 py-1 text-xs font-mono"
                                                        required
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={editForm.processing}
                                                        className="bg-forest text-stone-100 hover:bg-forest-dark text-[11px] font-bold px-3 py-1 rounded-md"
                                                    >
                                                        Guardar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingPermission(null)}
                                                        className="text-ink-muted hover:text-ink text-[11px] px-2 py-1"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </form>
                                            ) : (
                                                <span className="font-mono text-xs text-ink font-medium">{perm.name}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-ink-muted">
                                            {perm.guard_name}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleStartEdit(perm)}
                                                    className="hover:bg-paper-dark text-forest hover:text-forest-dark rounded-lg p-1.5 transition-colors"
                                                    title="Editar permiso"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(perm)}
                                                    className="hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg p-1.5 transition-colors"
                                                    title="Eliminar permiso"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
