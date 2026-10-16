import React, { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import PageShell from '@/layouts/page-shell';
import { ButtonEditorial } from '@/components/ui/button-editorial';

interface AuthHubProps {
    initialTab?: 'login' | 'register';
    status?: string;
    canResetPassword?: boolean;
}

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface RegisterForm {
    name: string;
    email: string;
    dni: string;
    phone: string;
    address: string;
    postal_code: string;
    password: string;
    password_confirmation: string;
}

export default function AuthHub({
    initialTab = 'login',
    status,
    canResetPassword = true,
}: AuthHubProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);

    // Formulario de Login
    const loginForm = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    // Formulario de Registro
    const registerForm = useForm<RegisterForm>({
        name: '',
        email: '',
        dni: '',
        phone: '',
        address: '',
        postal_code: '',
        password: '',
        password_confirmation: '',
    });

    const handleTabChange = (tab: 'login' | 'register') => {
        setActiveTab(tab);
        if (typeof window !== 'undefined') {
            const newUrl = tab === 'login' ? '/login' : '/register';
            window.history.replaceState(null, '', newUrl);
        }
    };

    const submitLogin: FormEventHandler = (e) => {
        e.preventDefault();
        loginForm.post('/login', {
            onFinish: () => loginForm.reset('password'),
        });
    };

    const submitRegister: FormEventHandler = (e) => {
        e.preventDefault();
        registerForm.post('/register', {
            onFinish: () => registerForm.reset('password', 'password_confirmation'),
        });
    };

    const loginError = loginForm.errors.email || loginForm.errors.password;

    return (
        <PageShell>
            <Head
                title={
                    activeTab === 'login'
                        ? 'Iniciar Sesión | Alma Lectora'
                        : 'Crear Cuenta | Alma Lectora'
                }
            />

            <div className="flex flex-col justify-center min-h-[calc(100vh-250px)] py-4 sm:py-8 animate-fade-in">
                <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-paper-dark/70 bg-paper-light/95 shadow-xl">
                    <div className="lg:grid lg:grid-cols-12">
                        {/* Columna Izquierda: Banner Editorial Institucional (Visible en Desktop) */}
                        <div className="hidden lg:col-span-5 lg:flex flex-col justify-between bg-forest p-8 text-stone-100 relative overflow-hidden">
                            {/* Adorno sutil de fondo */}
                            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/5 blur-2xl"></div>
                            <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-2xl"></div>

                            {/* Encabezado editorial */}
                            <div className="relative z-10 border-b border-white/10 pb-5">
                                <div className="mb-2 flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-amber-100">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                        </svg>
                                    </div>
                                    <span className="font-serif text-lg font-bold tracking-wider text-amber-50">
                                        Tu Espacio Literario
                                    </span>
                                </div>
                                <p className="text-xs text-stone-300">
                                    Libros seleccionados, accesorios y momentos para leer
                                </p>
                            </div>

                            {/* Cita literaria y beneficios adaptados según la pestaña activa */}
                            <div className={`relative z-10 my-auto ${
                                activeTab === 'login'
                                    ? 'py-4 space-y-8 sm:space-y-9'
                                    : 'py-3 space-y-7 sm:space-y-8'
                            } transition-all duration-300`}>
                                {activeTab === 'register' && (
                                    <div className="rounded-2xl bg-white/10 p-3.5 text-xs text-amber-100 border border-white/10 animate-fade-in">
                                        <p className="font-serif font-bold text-amber-50 text-[13px]">
                                            ¿Por qué crear tu cuenta?
                                        </p>
                                        <p className="mt-1 text-[11px] text-stone-200 leading-relaxed">
                                            Te toma menos de un minuto y te brinda acceso permanente a tu portal de pedidos, remitos oficiales y un checkout mucho más ágil.
                                        </p>
                                    </div>
                                )}

                                <blockquote className="border-l-2 border-amber-200/50 pl-4 italic text-stone-200 text-xs sm:text-[13px] leading-relaxed">
                                    «De los diversos instrumentos del hombre, el más asombroso es, sin duda, el libro; todos los demás son extensiones de su cuerpo, pero el libro es una extensión de la memoria y de la imaginación.»
                                    <span className="mt-2 block text-[11px] font-semibold text-amber-200/90 not-italic">
                                        — Jorge Luis Borges
                                    </span>
                                </blockquote>

                                <div className="space-y-3.5 pt-1 text-xs text-stone-200">
                                    <div className="flex items-start gap-2.5">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-emerald-300">
                                            ✓
                                        </span>
                                        <span>
                                            <strong>Historial de compras:</strong> Accedé a tus remitos oficiales en PDF.
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-emerald-300">
                                            ✓
                                        </span>
                                        <span>
                                            <strong>Checkout simplificado:</strong> Datos de envío autocompletados.
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-emerald-300">
                                            ✓
                                        </span>
                                        <span>
                                            <strong>Atención directa:</strong> Cierre de pedidos personalizado por WhatsApp.
                                        </span>
                                    </div>

                                    {activeTab === 'register' && (
                                        <div className="flex items-start gap-2.5 animate-fade-in">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-emerald-300">
                                                ✓
                                            </span>
                                            <span>
                                                <strong>Tus datos protegidos:</strong> Solo se utilizan para la logística de tus pedidos.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pie de banner con separador sutil */}
                            <div className="relative z-10 border-t border-white/10 pt-4 text-[11px] text-stone-400">
                                Salta, Argentina &bull; Proyecto PAW UNSa
                            </div>
                        </div>

                        {/* Columna Derecha: Hub con Pestañas */}
                        <div className="p-6 sm:p-8 md:p-10 lg:col-span-7 flex flex-col justify-between">
                            <div>
                                {/* Selector de Pestañas Superior */}
                                <div className="grid grid-cols-2 rounded-2xl bg-paper-dark/60 p-1.5 mb-6 border border-paper-dark">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('login')}
                                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                                            activeTab === 'login'
                                                ? 'bg-forest text-white font-serif font-bold shadow-xs'
                                                : 'text-ink-muted hover:text-ink font-medium'
                                        }`}
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                        <span>Iniciar Sesión</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('register')}
                                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm transition-all duration-200 ${
                                            activeTab === 'register'
                                                ? 'bg-forest text-white font-serif font-bold shadow-xs'
                                                : 'text-ink-muted hover:text-ink font-medium'
                                        }`}
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                                        </svg>
                                        <span>Crear Cuenta</span>
                                    </button>
                                </div>

                                {/* Notificación de Estado / Flash */}
                                {status && (
                                    <div className="bg-forest/10 border-forest/30 text-forest mb-4 flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold animate-fade-in">
                                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                        <span>{status}</span>
                                    </div>
                                )}

                                {/* ================== CONTENIDO: INICIAR SESIÓN ================== */}
                                {activeTab === 'login' && (
                                    <div className="animate-fade-in">
                                        <div className="mb-5">
                                            <h2 className="font-serif text-2xl font-bold text-ink">
                                                Bienvenido/a
                                            </h2>
                                            <p className="text-xs text-ink-muted mt-1">
                                                Accedé a tu cuenta para ver tus pedidos o gestionar la tienda
                                            </p>
                                        </div>

                                        {loginError && (
                                            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 animate-fade-in">
                                                <svg className="h-4 w-4 shrink-0 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                                </svg>
                                                <span>{loginError}</span>
                                            </div>
                                        )}

                                        <form onSubmit={submitLogin} className="space-y-4">
                                            {/* Email */}
                                            <div>
                                                <label htmlFor="login_email" className="text-ink mb-1.5 block text-xs font-bold tracking-wider uppercase">
                                                    Correo Electrónico
                                                </label>
                                                <input
                                                    id="login_email"
                                                    type="email"
                                                    required
                                                    autoFocus
                                                    autoComplete="email"
                                                    value={loginForm.data.email}
                                                    onChange={(e) => loginForm.setData('email', e.target.value)}
                                                    placeholder="tuemail@ejemplo.com"
                                                    className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2.5 text-sm transition-all focus:ring-2 focus:outline-none"
                                                />
                                            </div>

                                            {/* Password */}
                                            <div>
                                                <div className="mb-1.5 flex items-center justify-between">
                                                    <label htmlFor="login_password" className="text-ink block text-xs font-bold tracking-wider uppercase">
                                                        Contraseña
                                                    </label>
                                                    {canResetPassword && (
                                                        <Link
                                                            href="/forgot-password"
                                                            className="text-forest hover:text-forest-dark text-xs transition-colors hover:underline"
                                                        >
                                                            ¿Olvidaste tu contraseña?
                                                        </Link>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        id="login_password"
                                                        type={showLoginPassword ? 'text' : 'password'}
                                                        required
                                                        autoComplete="current-password"
                                                        value={loginForm.data.password}
                                                        onChange={(e) => loginForm.setData('password', e.target.value)}
                                                        placeholder="••••••••"
                                                        className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2.5 pr-10 text-sm transition-all focus:ring-2 focus:outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                        className="text-stone-400 hover:text-forest absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 transition-colors"
                                                        aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                    >
                                                        {showLoginPassword ? (
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
                                            </div>

                                            {/* Recordar sesión */}
                                            <div className="flex items-center gap-2 pt-1">
                                                <input
                                                    id="remember"
                                                    type="checkbox"
                                                    checked={loginForm.data.remember}
                                                    onChange={(e) => loginForm.setData('remember', e.target.checked)}
                                                    className="text-forest focus:ring-forest/40 h-4 w-4 cursor-pointer rounded border-stone-300 accent-[#2C4C38]"
                                                />
                                                <label htmlFor="remember" className="text-ink-muted cursor-pointer select-none text-xs">
                                                    Recordar sesión en este dispositivo
                                                </label>
                                            </div>

                                            {/* Botón de ingreso */}
                                            <div className="pt-2">
                                                <ButtonEditorial
                                                    type="submit"
                                                    variant="primary"
                                                    isLoading={loginForm.processing}
                                                    className="w-full rounded-xl py-2.5 font-serif text-sm font-bold shadow-xs"
                                                >
                                                    Iniciar Sesión
                                                </ButtonEditorial>
                                            </div>
                                        </form>

                                        {/* Acceso para personal administrativo */}
                                        <div className="mt-6 border-t border-paper-dark/60 pt-4 text-center">
                                            <p className="text-[11px] text-ink-muted">
                                                ¿Sos parte del equipo editorial o administración? Podés ingresar desde aquí mismo con tus credenciales asignadas.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* ================== CONTENIDO: CREAR CUENTA ================== */}
                                {activeTab === 'register' && (
                                    <div className="animate-fade-in">
                                        <div className="mb-4">
                                            <h2 className="font-serif text-2xl font-bold text-ink">
                                                Crear una Cuenta
                                            </h2>
                                            <p className="text-xs text-ink-muted mt-1">
                                                Registrate para agilizar tus compras y acceder a tu historial de pedidos
                                            </p>
                                        </div>

                                        <form onSubmit={submitRegister} className="space-y-3.5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {/* Nombre */}
                                                <div className="sm:col-span-2">
                                                    <label htmlFor="reg_name" className="text-ink mb-1 block text-xs font-bold tracking-wider uppercase">
                                                        Nombre y Apellido <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="reg_name"
                                                        type="text"
                                                        required
                                                        autoFocus
                                                        value={registerForm.data.name}
                                                        onChange={(e) => registerForm.setData('name', e.target.value)}
                                                        placeholder="ej: Juan Pérez"
                                                        className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2 text-xs transition-all focus:ring-2 focus:outline-none"
                                                    />
                                                    {registerForm.errors.name && (
                                                        <p className="mt-1 text-[11px] text-red-600 font-medium">{registerForm.errors.name}</p>
                                                    )}
                                                </div>

                                                {/* Email */}
                                                <div className="sm:col-span-2">
                                                    <label htmlFor="reg_email" className="text-ink mb-1 block text-xs font-bold tracking-wider uppercase">
                                                        Correo Electrónico <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="reg_email"
                                                        type="email"
                                                        required
                                                        autoComplete="email"
                                                        value={registerForm.data.email}
                                                        onChange={(e) => registerForm.setData('email', e.target.value)}
                                                        placeholder="tuemail@ejemplo.com"
                                                        className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2 text-xs transition-all focus:ring-2 focus:outline-none"
                                                    />
                                                    {registerForm.errors.email && (
                                                        <p className="mt-1 text-[11px] text-red-600 font-medium">{registerForm.errors.email}</p>
                                                    )}
                                                </div>

                                                {/* DNI */}
                                                <div>
                                                    <label htmlFor="reg_dni" className="text-ink mb-1 block text-xs font-bold tracking-wider uppercase">
                                                        DNI / CUIT <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="reg_dni"
                                                        type="text"
                                                        required
                                                        value={registerForm.data.dni}
                                                        onChange={(e) => registerForm.setData('dni', e.target.value)}
                                                        placeholder="ej: 38123456"
                                                        className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2 text-xs transition-all focus:ring-2 focus:outline-none"
                                                    />
                                                    {registerForm.errors.dni && (
                                                        <p className="mt-1 text-[11px] text-red-600 font-medium">{registerForm.errors.dni}</p>
                                                    )}
                                                </div>

                                                {/* Teléfono */}
                                                <div>
                                                    <label htmlFor="reg_phone" className="text-ink mb-1 block text-xs font-bold tracking-wider uppercase">
                                                        Teléfono / Celular <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="reg_phone"
                                                        type="tel"
                                                        required
                                                        value={registerForm.data.phone}
                                                        onChange={(e) => registerForm.setData('phone', e.target.value)}
                                                        placeholder="ej: +54 9 387 123-4567"
                                                        className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2 text-xs transition-all focus:ring-2 focus:outline-none"
                                                    />
                                                    {registerForm.errors.phone && (
                                                        <p className="mt-1 text-[11px] text-red-600 font-medium">{registerForm.errors.phone}</p>
                                                    )}
                                                </div>

                                                {/* Dirección */}
                                                <div className="sm:col-span-2">
                                                    <label htmlFor="reg_address" className="text-ink mb-1 block text-xs font-bold tracking-wider uppercase">
                                                        Dirección de Envío <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="reg_address"
                                                        type="text"
                                                        required
                                                        value={registerForm.data.address}
                                                        onChange={(e) => registerForm.setData('address', e.target.value)}
                                                        placeholder="Calle, número, piso o depto"
                                                        className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2 text-xs transition-all focus:ring-2 focus:outline-none"
                                                    />
                                                    {registerForm.errors.address && (
                                                        <p className="mt-1 text-[11px] text-red-600 font-medium">{registerForm.errors.address}</p>
                                                    )}
                                                </div>

                                                {/* Código Postal */}
                                                <div className="sm:col-span-2">
                                                    <label htmlFor="reg_cp" className="text-ink mb-1 block text-xs font-bold tracking-wider uppercase">
                                                        Código Postal <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="reg_cp"
                                                        type="text"
                                                        required
                                                        value={registerForm.data.postal_code}
                                                        onChange={(e) => registerForm.setData('postal_code', e.target.value)}
                                                        placeholder="ej: 4400"
                                                        className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2 text-xs transition-all focus:ring-2 focus:outline-none"
                                                    />
                                                    {registerForm.errors.postal_code && (
                                                        <p className="mt-1 text-[11px] text-red-600 font-medium">{registerForm.errors.postal_code}</p>
                                                    )}
                                                </div>

                                                {/* Contraseña */}
                                                <div>
                                                    <label htmlFor="reg_password" className="text-ink mb-1 block text-xs font-bold tracking-wider uppercase">
                                                        Contraseña <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            id="reg_password"
                                                            type={showRegisterPassword ? 'text' : 'password'}
                                                            required
                                                            autoComplete="new-password"
                                                            value={registerForm.data.password}
                                                            onChange={(e) => registerForm.setData('password', e.target.value)}
                                                            placeholder="••••••••"
                                                            className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2 pr-9 text-xs transition-all focus:ring-2 focus:outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                                            className="text-stone-400 hover:text-forest absolute inset-y-0 right-0 flex cursor-pointer items-center pr-2.5 transition-colors"
                                                            aria-label={showRegisterPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                        >
                                                            {showRegisterPassword ? (
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
                                                    {registerForm.errors.password && (
                                                        <p className="mt-1 text-[11px] text-red-600 font-medium">{registerForm.errors.password}</p>
                                                    )}
                                                </div>

                                                {/* Confirmar Contraseña */}
                                                <div>
                                                    <label htmlFor="reg_confirm" className="text-ink mb-1 block text-xs font-bold tracking-wider uppercase">
                                                        Confirmar <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        id="reg_confirm"
                                                        type={showRegisterPassword ? 'text' : 'password'}
                                                        required
                                                        autoComplete="new-password"
                                                        value={registerForm.data.password_confirmation}
                                                        onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                                                        placeholder="••••••••"
                                                        className="bg-paper border-stone-300 text-ink placeholder:text-stone-400 focus:ring-forest/40 focus:border-forest w-full rounded-xl border p-2 text-xs transition-all focus:ring-2 focus:outline-none"
                                                    />
                                                    {registerForm.errors.password_confirmation && (
                                                        <p className="mt-1 text-[11px] text-red-600 font-medium">{registerForm.errors.password_confirmation}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Botón de envío */}
                                            <div className="pt-2">
                                                <ButtonEditorial
                                                    type="submit"
                                                    variant="primary"
                                                    isLoading={registerForm.processing}
                                                    className="w-full rounded-xl py-2.5 font-serif text-sm font-bold shadow-xs"
                                                >
                                                    Crear mi Cuenta
                                                </ButtonEditorial>
                                            </div>
                                        </form>

                                        {/* Nota de privacidad */}
                                        <div className="mt-4 text-center">
                                            <p className="text-[11px] text-ink-muted">
                                                Tus datos personales y de entrega se resguardan de forma segura exclusivamente para la logística de tus pedidos.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
