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

    // If cart is empty on initial load, redirect to catalog after small delay
    useEffect(() => {
        if (items.length === 0 && step !== 2) {
            const timeout = setTimeout(() => {
                router.visit('/');
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [items.length, step]);

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
            window.location.href = whatsappUrl;
        } catch (error) {
            console.error('Error confirming order lead:', error);
            setErrorMessage('No se pudo procesar la solicitud. Por favor verificá tu conexión.');
            setIsSubmitting(false);
        }
    };

    const stepsLabels = ['Envío', 'Datos Personales', 'Confirmación'];

    if (items.length === 0 && step !== 2) {
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
