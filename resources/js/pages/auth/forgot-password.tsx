import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PageShell from '@/layouts/page-shell';
import { ButtonEditorial } from '@/components/ui/button-editorial';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <PageShell>
            <Head title="Recuperar Contraseña | Alma Lectora" />

            <div className="mx-auto max-w-md px-4 py-12 sm:py-16 animate-fade-in">
                <div className="rounded-3xl border border-paper-dark/70 bg-paper-light/95 p-6 sm:p-8 shadow-xl">
                    {/* Encabezado */}
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 text-forest">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                            </svg>
                        </div>
                        <h1 className="font-serif text-2xl font-bold text-ink">
                            Recuperar Contraseña
                        </h1>
                        <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                            Ingresá tu correo electrónico registrado y te enviaremos un enlace seguro para restablecer tu clave.
                        </p>
                    </div>

                    {/* Mensaje de éxito */}
                    {status && (
                        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs font-semibold text-emerald-800 animate-fade-in">
                            <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            <span>{status}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="text-ink mb-1.5 block text-xs font-bold tracking-wider uppercase">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="tuemail@ejemplo.com"
                                className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2.5 text-sm transition-all focus:ring-2 focus:outline-none"
                            />
                            {errors.email && (
                                <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <ButtonEditorial
                                type="submit"
                                variant="primary"
                                isLoading={processing}
                                className="w-full rounded-xl py-2.5 font-serif text-sm font-bold shadow-xs"
                            >
                                Enviar Enlace de Recuperación
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
