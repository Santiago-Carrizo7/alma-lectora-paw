import { Head, Link, useForm } from '@inertiajs/react';
import React, { FormEventHandler, useState } from 'react';

import { ButtonEditorial } from '@/components/ui/button-editorial';
import PageShell from '@/layouts/page-shell';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const errorMessage = errors.email || errors.password;

    return (
        <PageShell>
            <Head title="Acceso Administrativo | Alma Lectora" />

            <div className="mx-auto max-w-md px-4 py-12">
                <div className="bg-paper-dark/80 border-paper-dark rounded-2xl border p-6 shadow-sm sm:p-8">
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <h1 className="text-ink mb-1 font-serif text-2xl font-bold">Acceso Administrativo</h1>
                        <p className="text-ink-muted text-xs">Iniciá sesión para gestionar el catálogo y la tienda</p>
                    </div>

                    {/* Status notification */}
                    {status && (
                        <div className="bg-forest/10 border-forest/30 text-forest mb-4 flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold">
                            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            <span>{status}</span>
                        </div>
                    )}

                    {/* Error alert */}
                    {errorMessage && (
                        <div className="animate-fade-in mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                            <svg className="h-4 w-4 shrink-0 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                />
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Email field */}
                        <div>
                            <label htmlFor="email" className="text-ink mb-1.5 block text-xs font-bold tracking-wider uppercase">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="admin@almalectora.com"
                                className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2.5 text-sm transition-all focus:ring-2 focus:outline-none"
                            />
                        </div>

                        {/* Password field with show/hide toggle */}
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label htmlFor="password" className="text-ink block text-xs font-bold tracking-wider uppercase">
                                    Contraseña
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-forest hover:text-forest-dark text-xs transition-colors hover:underline"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2.5 pr-10 text-sm transition-all focus:ring-2 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-stone-400 hover:text-forest absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 transition-colors"
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                            />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                            />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember me checkbox */}
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="text-forest focus:ring-forest/40 h-4 w-4 cursor-pointer rounded border-stone-300 accent-[#2C4C38]"
                            />
                            <label htmlFor="remember" className="text-ink-muted cursor-pointer select-none text-xs">
                                Recordar sesión en este dispositivo
                            </label>
                        </div>

                        {/* Submit button */}
                        <div className="pt-2">
                            <ButtonEditorial
                                type="submit"
                                variant="primary"
                                isLoading={processing}
                                className="w-full rounded-xl py-2.5 font-serif text-sm font-bold shadow-xs"
                            >
                                Ingresar al Panel
                            </ButtonEditorial>
                        </div>
                    </form>
                </div>
            </div>
        </PageShell>
    );
}
