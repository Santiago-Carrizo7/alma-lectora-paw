import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

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

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        dni: '',
        phone: '',
        address: '',
        postal_code: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Crear Cuenta en Alma Lectora"
            description="Completá tus datos para agilizar tus compras y acceder a tu historial de pedidos"
        >
            <Head title="Registro de Usuario | Alma Lectora" />

            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-4">
                    {/* Nombre */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold">
                            Nombre y Apellido <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="ej: Santiago Carrizo"
                            className="text-xs"
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Email */}
                    <div className="grid gap-1.5">
                        <Label htmlFor="email" className="text-xs font-semibold">
                            Correo Electrónico <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="tuemail@ejemplo.com"
                            className="text-xs"
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* DNI y Teléfono */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="dni" className="text-xs font-semibold">
                                DNI / Documento <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="dni"
                                type="text"
                                required
                                tabIndex={3}
                                value={data.dni}
                                onChange={(e) => setData('dni', e.target.value)}
                                disabled={processing}
                                placeholder="ej: 42123456"
                                className="text-xs"
                            />
                            <InputError message={errors.dni} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="phone" className="text-xs font-semibold">
                                Teléfono (WhatsApp) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                tabIndex={4}
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                disabled={processing}
                                placeholder="ej: 3875123456"
                                className="text-xs"
                            />
                            <InputError message={errors.phone} />
                        </div>
                    </div>

                    {/* Dirección y Código Postal */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 grid gap-1.5">
                            <Label htmlFor="address" className="text-xs font-semibold">
                                Dirección de Entrega <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="address"
                                type="text"
                                required
                                tabIndex={5}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                disabled={processing}
                                placeholder="Calle, número, piso/depto"
                                className="text-xs"
                            />
                            <InputError message={errors.address} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="postal_code" className="text-xs font-semibold">
                                Código Postal <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="postal_code"
                                type="text"
                                required
                                tabIndex={6}
                                value={data.postal_code}
                                onChange={(e) => setData('postal_code', e.target.value)}
                                disabled={processing}
                                placeholder="ej: 4400"
                                className="text-xs"
                            />
                            <InputError message={errors.postal_code} />
                        </div>
                    </div>

                    {/* Contraseñas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold">
                                Contraseña <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                tabIndex={7}
                                autoComplete="new-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="Mínimo 8 caracteres"
                                className="text-xs"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="password_confirmation" className="text-xs font-semibold">
                                Confirmar Contraseña <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                required
                                tabIndex={8}
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="Repita la contraseña"
                                className="text-xs"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>
                    </div>

                    <Button type="submit" className="bg-forest hover:bg-forest-dark text-stone-100 font-serif font-bold mt-2 w-full text-xs shadow-xs" tabIndex={9} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        Registrarme
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-xs">
                    ¿Ya tenés una cuenta?{' '}
                    <TextLink href="/login" tabIndex={10} className="text-forest hover:underline font-semibold">
                        Iniciá sesión aquí
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
