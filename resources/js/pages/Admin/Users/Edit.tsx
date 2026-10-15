import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';

interface RoleRef {
    id: number;
    name: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
}

interface EditUserProps {
    user: UserData;
    roles: RoleRef[];
    userRoles: string[];
}

export default function EditUser({ user, roles, userRoles }: EditUserProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: userRoles || [],
        is_active: user.is_active ?? true,
    });

    const handleRoleToggle = (roleName: string) => {
        if (data.roles.includes(roleName)) {
            setData(
                'roles',
                data.roles.filter((r) => r !== roleName)
            );
        } else {
            setData('roles', [...data.roles, roleName]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/usuarios/${user.id}`);
    };

    return (
        <AdminLayout
            title={`Editar Usuario: ${user.name}`}
            subtitle="Modifique la información de la cuenta, roles y contraseña"
            breadcrumbText="Volver a Usuarios"
            breadcrumbHref="/admin/usuarios"
        >
            <Head title={`Editar ${user.name} | Alma Lectora Admin`} />

            <form onSubmit={handleSubmit} className="bg-paper border-paper-dark/60 max-w-2xl space-y-6 rounded-2xl border p-6 sm:p-8 shadow-xs">
                {/* Nombre */}
                <div>
                    <label className="text-ink font-serif text-sm font-bold block mb-1">
                        Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="border-paper-dark/60 bg-paper-light focus:border-forest focus:ring-forest w-full rounded-xl border px-4 py-2.5 text-sm transition-colors"
                        required
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="text-ink font-serif text-sm font-bold block mb-1">
                        Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="border-paper-dark/60 bg-paper-light focus:border-forest focus:ring-forest w-full rounded-xl border px-4 py-2.5 text-sm transition-colors"
                        required
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                {/* Cambio de Contraseña (Opcional) */}
                <div className="border-t border-paper-dark/60 pt-6">
                    <h3 className="text-ink font-serif text-sm font-bold mb-1">Cambiar Contraseña</h3>
                    <p className="text-ink-muted text-xs mb-4">Deje estos campos en blanco si no desea modificar la contraseña actual.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-ink text-xs font-semibold block mb-1">Nueva Contraseña</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="border-paper-dark/60 bg-paper-light focus:border-forest focus:ring-forest w-full rounded-xl border px-4 py-2 text-sm transition-colors"
                            />
                            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="text-ink text-xs font-semibold block mb-1">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="border-paper-dark/60 bg-paper-light focus:border-forest focus:ring-forest w-full rounded-xl border px-4 py-2 text-sm transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Asignación de Roles */}
                <div className="border-t border-paper-dark/60 pt-6 space-y-3">
                    <label className="text-ink font-serif text-sm font-bold block">
                        Gestionar Roles Asignados
                    </label>

                    {/* ALERTA DE ERROR DE ROL CRÍTICO (Según estándar Cátedra) */}
                    {errors.roles && (
                        <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2.5 border border-red-200 animate-fade-in">
                            <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <span className="font-semibold">{errors.roles}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {roles.map((r) => {
                            const isChecked = data.roles.includes(r.name);
                            return (
                                <label
                                    key={r.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                        isChecked
                                            ? 'bg-forest/5 border-forest/30 text-ink'
                                            : 'bg-paper-light/50 border-paper-dark/40 text-ink-muted hover:bg-paper-light'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleRoleToggle(r.name)}
                                        className="text-forest focus:ring-forest rounded"
                                    />
                                    <div>
                                        <span className="font-bold capitalize">{r.name}</span>
                                        <p className="text-[10px] text-ink-muted">
                                            {r.name === 'super-admin'
                                                ? 'Acceso total y administración de seguridad'
                                                : r.name === 'admin'
                                                ? 'Gestión de catálogo, pedidos y reportes'
                                                : r.name === 'client'
                                                ? 'Comprador registrado con historial'
                                                : 'Navegación general'}
                                        </p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Estado Activo */}
                <div className="border-t border-paper-dark/60 pt-4 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_active_edit"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="text-forest focus:ring-forest rounded"
                    />
                    <label htmlFor="is_active_edit" className="text-xs text-ink font-semibold cursor-pointer">
                        Usuario activo (permite iniciar sesión)
                    </label>
                </div>

                {/* Botones de acción */}
                <div className="border-t border-paper-dark/60 pt-6 flex items-center justify-end gap-3">
                    <Link
                        href="/admin/usuarios"
                        className="hover:bg-paper-dark text-ink-muted hover:text-ink rounded-xl px-5 py-2.5 text-xs font-semibold transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-forest text-stone-100 hover:bg-forest-dark disabled:opacity-50 rounded-xl px-6 py-2.5 text-xs font-serif font-bold shadow-xs transition-colors"
                    >
                        {processing ? 'Actualizando...' : 'Actualizar Usuario'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
