import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { StepCustomer } from '../../components/checkout/step-customer';
import { StepIndicator } from '../../components/checkout/step-indicator';
import { StepShipping } from '../../components/checkout/step-shipping';
import { StepSummary } from '../../components/checkout/step-summary';
import { ButtonEditorial } from '../../components/ui/button-editorial';
import { PageShell } from '../../layouts/page-shell';
import { useCart } from '../../lib/cart-store';
import { buildWhatsAppUrl } from '../../lib/whatsapp';
import type { CustomerFormData, ShippingFormData } from '../../types/alma';
import type { SharedData } from '../../types/index';

type CheckoutStep = 0 | 1 | 2;

export default function CheckoutIndex() {
    const { props } = usePage<SharedData>();
    const user = props.auth?.user as Record<string, any> | null;
    const storeConfig = props.storeConfig;
    const { items, totalAmount, clearCart } = useCart();

    const [step, setStep] = useState<CheckoutStep>(0);
    const [shipping, setShipping] = useState<ShippingFormData | null>(() => {
        if (user && (user.address || user.postal_code)) {
            return {
                postalCode: (user.postal_code as string) || '',
                address: (user.address as string) || '',
            };
        }
        return null;
    });
    const [customer, setCustomer] = useState<CustomerFormData | null>(() => {
        if (user) {
            return {
                customerName: user.name || '',
                customerEmail: user.email || '',
                customerDni: (user.dni as string) || '',
                customerPhone: (user.phone as string) || '',
            };
        }
        return null;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [completedOrder, setCompletedOrder] = useState<{
        orderId: string;
        whatsappUrl: string;
    } | null>(null);

    // If cart is empty on initial load, redirect to catalog after small delay
    useEffect(() => {
        if (items.length === 0 && step !== 2 && !completedOrder) {
            const timeout = setTimeout(() => {
                router.visit('/');
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [items.length, step, completedOrder]);

    const handleShippingNext = (data: ShippingFormData) => {
        setShipping(data);
        setErrorMessage(null);
        setStep(1);
    };

    const handleCustomerNext = (data: CustomerFormData) => {
        setCustomer(data);
        setErrorMessage(null);
        setStep(2);
    };

    const handleConfirmOrder = async () => {
        if (!shipping || !customer || items.length === 0) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        const csrfToken =
            document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

        const payload = {
            customer_name: customer.customerName,
            customer_phone: customer.customerPhone,
            customer_email: customer.customerEmail,
            customer_dni: customer.customerDni,
            postal_code: shipping.postalCode,
            address: shipping.address,
            items: items.map((item) => ({
                id: item.id,
                type: item.type,
                title: item.title,
                quantity: item.quantity,
                unit_price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price),
                cover_url: item.coverUrl ?? null,
            })),
            total_amount: typeof totalAmount === 'string' ? parseFloat(totalAmount) : Number(totalAmount),
        };

        try {
            const response = await fetch('/pedidos/lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorText =
                    data.errors?.stock?.[0] ||
                    data.errors?.store?.[0] ||
                    data.message ||
                    'Ocurrió un inconveniente al validar tu pedido.';
                setErrorMessage(errorText);
                setIsSubmitting(false);
                return;
            }

            // Build structured WhatsApp URL and redirect
            const whatsappPhone =
                storeConfig?.whatsapp_phone || storeConfig?.whatsappPhone || '5493875708557';

            const whatsappUrl = buildWhatsAppUrl(
                {
                    customerName: customer.customerName,
                    customerDni: customer.customerDni,
                    customerPhone: customer.customerPhone,
                    customerEmail: customer.customerEmail,
                    postalCode: shipping.postalCode,
                    address: shipping.address,
                },
                items,
                totalAmount,
                whatsappPhone
            );

            clearCart();
            setCompletedOrder({
                orderId: data.orderId,
                whatsappUrl,
            });
            setIsSubmitting(false);

            // Abrir WhatsApp en una nueva pestaña sin bloquear la navegación de la tienda
            if (typeof window !== 'undefined') {
                window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            }
        } catch (error) {
            console.error('Error confirming order lead:', error);
            setErrorMessage('No se pudo procesar la solicitud. Por favor verificá tu conexión.');
            setIsSubmitting(false);
        }
    };

    const stepsLabels = ['Envío', 'Datos Personales', 'Confirmación'];

    if (completedOrder) {
        const shortId = completedOrder.orderId ? completedOrder.orderId.substring(0, 8).toUpperCase() : '';
        return (
            <PageShell>
                <Head title="Pedido Registrado | Alma Lectora" />
                <div className="mx-auto max-w-xl py-12 px-4 animate-fade-in">
                    <div className="rounded-3xl border border-paper-dark/70 bg-paper-light/95 p-6 sm:p-8 shadow-xl text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest/10 text-forest">
                            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                        </div>

                        {shortId && (
                            <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 border border-amber-200">
                                Orden #{shortId} &bull; Pendiente de coordinar
                            </span>
                        )}

                        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-3">
                            ¡Registramos tu pedido!
                        </h1>

                        <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed max-w-md mx-auto">
                            Hemos guardado tu solicitud en el sistema y te enviamos el comprobante por correo electrónico. Abrimos WhatsApp en una pestaña nueva para coordinar el pago y la entrega.
                        </p>

                        <div className="my-6 rounded-2xl bg-paper p-4 border border-stone-200/80 text-left">
                            <p className="text-xs text-stone-600 mb-3">
                                ¿No se abrió WhatsApp automáticamente o cerraste la ventana? Podés continuar tu pedido haciendo clic aquí:
                            </p>
                            <a
                                href={completedOrder.whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] py-3 px-4 font-semibold text-white shadow-md transition-all cursor-pointer text-sm"
                            >
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                                </svg>
                                <span>Abrir conversación en WhatsApp</span>
                            </a>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                            {user && (
                                <Link
                                    href="/mis-compras"
                                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-forest/30 bg-forest/5 px-4 py-2.5 text-xs font-bold text-forest hover:bg-forest/10 transition"
                                >
                                    Ver en Mis Compras
                                </Link>
                            )}
                            <Link
                                href="/"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-stone-300 bg-paper px-4 py-2.5 text-xs font-semibold text-ink hover:bg-paper-dark transition"
                            >
                                Volver a la Tienda
                            </Link>
                        </div>
                    </div>
                </div>
            </PageShell>
        );
    }

    if (items.length === 0 && step !== 2 && !completedOrder) {
        return (
            <PageShell>
                <Head title="Carrito Vacío | Alma Lectora" />
                <div className="mx-auto max-w-lg py-16 text-center">
                    <svg
                        className="text-stone-300 mx-auto h-16 w-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                    </svg>
                    <h2 className="text-ink font-serif mt-4 text-xl font-bold">Tu carrito está vacío</h2>
                    <p className="text-stone-500 mt-2 text-sm">
                        Agregá libros, accesorios o combos para iniciar tu pedido.
                    </p>
                    <Link href="/libros" className="mt-6 inline-block">
                        <ButtonEditorial>Explorar Catálogo</ButtonEditorial>
                    </Link>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell>
            <Head title="Finalizar Compra — Checkout | Alma Lectora" />

            <div className="mx-auto max-w-2xl py-6">
                {/* Banner de Usuario / Invitado */}
                {user ? (
                    <div className="mb-4 bg-forest/10 border border-forest/30 text-forest text-xs rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            <span>Comprando como <strong>{user.name}</strong> ({user.email}). Tus datos se han precargado.</span>
                        </div>
                    </div>
                ) : (
                    <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 shrink-0 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            <span>¿Ya tenés cuenta en Alma Lectora?</span>
                        </div>
                        <Link href="/login" className="text-forest hover:underline font-bold font-serif shrink-0">
                            Iniciá sesión aquí →
                        </Link>
                    </div>
                )}

                <div className="border-paper-dark/60 bg-paper-dark/10 rounded-xl border p-6 shadow-sm sm:p-8">
                    {/* Stepper Header */}
                    <StepIndicator steps={stepsLabels} currentStep={step} />

                    {/* Server/Validation Error Alert */}
                    {errorMessage && (
                        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 animate-fade-in">
                            <div className="flex items-center gap-2">
                                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>{errorMessage}</span>
                            </div>
                        </div>
                    )}

                    {/* Step Body */}
                    <div className="mt-6">
                        {step === 0 && (
                            <StepShipping
                                initialData={shipping}
                                onNext={handleShippingNext}
                                onCancel={() => router.visit('/')}
                            />
                        )}

                        {step === 1 && (
                            <StepCustomer
                                initialData={customer}
                                onNext={handleCustomerNext}
                                onBack={() => setStep(0)}
                            />
                        )}

                        {step === 2 && shipping && customer && (
                            <StepSummary
                                shipping={shipping}
                                customer={customer}
                                onBack={() => setStep(1)}
                                onConfirm={handleConfirmOrder}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
