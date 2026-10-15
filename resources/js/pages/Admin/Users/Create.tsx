import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { AdminLayout } from '../../../layouts/admin-layout';

interface RoleRef {
    id: number;
    name: string;
}

interface CreateUserProps {
    roles: RoleRef[];
}

export default function CreateUser({ roles }: CreateUserProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: ['client'] as string[],
        is_active: true,
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
        post('/admin/usuarios');
    };

    return (
        <AdminLayout
            title="Crear Nuevo Usuario"
            subtitle="Alta de credenciales y asignación de roles en la plataforma"
            breadcrumbText="Volver a Usuarios"
            breadcrumbHref="/admin/usuarios"
        >
            <Head title="Crear Usuario | Alma Lectora Admin" />

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
                        placeholder="ej: Santiago Carrizo"
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
                        placeholder="usuario@ejemplo.com"
                        className="border-paper-dark/60 bg-paper-light focus:border-forest focus:ring-forest w-full rounded-xl border px-4 py-2.5 text-sm transition-colors"
                        required
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                {/* Contraseñas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-ink font-serif text-sm font-bold block mb-1">
                            Contraseña <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="border-paper-dark/60 bg-paper-light focus:border-forest focus:ring-forest w-full rounded-xl border px-4 py-2.5 text-sm transition-colors"
                            required
                        />
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="text-ink font-serif text-sm font-bold block mb-1">
                            Confirmar Contraseña <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="border-paper-dark/60 bg-paper-light focus:border-forest focus:ring-forest w-full rounded-xl border px-4 py-2.5 text-sm transition-colors"
                            required
                        />
                    </div>
                </div>

                {/* Asignación de Roles */}
                <div className="border-t border-paper-dark/60 pt-6">
                    <label className="text-ink font-serif text-sm font-bold block mb-2">
                        Roles Asignados
                    </label>
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
                    {errors.roles && <p className="text-xs text-red-600 mt-1">{errors.roles}</p>}
                </div>

                {/* Estado Activo */}
                <div className="border-t border-paper-dark/60 pt-4 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_active"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="text-forest focus:ring-forest rounded"
                    />
                    <label htmlFor="is_active" className="text-xs text-ink font-semibold cursor-pointer">
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
                        {processing ? 'Guardando...' : 'Crear Usuario'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
