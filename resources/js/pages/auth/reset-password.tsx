import React, { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PageShell from '@/layouts/page-shell';
import { ButtonEditorial } from '@/components/ui/button-editorial';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token || '',
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <PageShell>
            <Head title="Restablecer Contraseña | Alma Lectora" />

            <div className="mx-auto max-w-md px-4 py-12 sm:py-16 animate-fade-in">
                <div className="rounded-3xl border border-paper-dark/70 bg-paper-light/95 p-6 sm:p-8 shadow-xl">
                    {/* Encabezado */}
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 text-forest">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </div>
                        <h1 className="font-serif text-2xl font-bold text-ink">
                            Nueva Contraseña
                        </h1>
                        <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                            Ingresá tu nueva contraseña para volver a acceder a tu cuenta de Alma Lectora.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="text-ink mb-1.5 block text-xs font-bold tracking-wider uppercase">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="bg-stone-100 border-stone-300 text-ink/80 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2.5 text-sm transition-all focus:ring-2 focus:outline-none"
                                placeholder="tuemail@ejemplo.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.email}</p>
                            )}
                        </div>

                        {/* Nueva Contraseña */}
                        <div>
                            <label htmlFor="password" className="text-ink mb-1.5 block text-xs font-bold tracking-wider uppercase">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    autoFocus
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Al menos 8 caracteres"
                                    className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2.5 pr-10 text-sm transition-all focus:ring-2 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-stone-400 hover:text-ink absolute right-3 top-1/2 -translate-y-1/2 transition p-1"
                                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    {showPassword ? (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirmar Contraseña */}
                        <div>
                            <label htmlFor="password_confirmation" className="text-ink mb-1.5 block text-xs font-bold tracking-wider uppercase">
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    type={showConfirm ? 'text' : 'password'}
                                    name="password_confirmation"
                                    required
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Repetí tu nueva contraseña"
                                    className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2.5 pr-10 text-sm transition-all focus:ring-2 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="text-stone-400 hover:text-ink absolute right-3 top-1/2 -translate-y-1/2 transition p-1"
                                    title={showConfirm ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    {showConfirm ? (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.password_confirmation}</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <ButtonEditorial
                                type="submit"
                                variant="primary"
                                isLoading={processing}
                                className="w-full rounded-xl py-2.5 font-serif text-sm font-bold shadow-xs"
                            >
                                Restablecer Contraseña
                            </ButtonEditorial>
                        </div>
                    </form>

                    {/* Volver a Login */}
                    <div className="mt-6 border-t border-paper-dark/60 pt-4 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-dark transition hover:underline"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            <span>Volver al inicio de sesión</span>
                        </Link>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
