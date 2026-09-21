import React, { useState } from 'react';
import type { CustomerFormData } from '../../types/alma';
import { ButtonEditorial } from '../ui/button-editorial';

interface StepCustomerProps {
    initialData: CustomerFormData | null;
    onNext: (data: CustomerFormData) => void;
    onBack: () => void;
}

export function StepCustomer({ initialData, onNext, onBack }: StepCustomerProps) {
    const [customerName, setCustomerName] = useState(initialData?.customerName ?? '');
    const [customerEmail, setCustomerEmail] = useState(initialData?.customerEmail ?? '');
    const [customerDni, setCustomerDni] = useState(initialData?.customerDni ?? '');
    const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone ?? '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !customerName.trim() ||
            !customerEmail.trim() ||
            !customerDni.trim() ||
            !customerPhone.trim()
        ) {
            setError('Por favor completá todos los datos personales solicitados.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail.trim())) {
            setError('Por favor ingresá un formato de correo electrónico válido.');
            return;
        }

        setError('');
        onNext({
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            customerDni: customerDni.trim(),
            customerPhone: customerPhone.trim(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-ink font-serif text-lg font-bold">2. Datos Personales</h3>
                <p className="text-stone-500 text-xs mt-1">
                    Información para identificar tu pedido y contactarte para coordinar el pago.
                </p>
            </div>

            {error && (
                <div className="border-red-200 bg-red-50 text-red-700 rounded-md border p-3 text-xs font-medium">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Nombre completo */}
                <div>
                    <label
                        htmlFor="customerName"
                        className="text-ink-muted mb-1.5 block text-xs font-bold tracking-wider uppercase"
                    >
                        Nombre y Apellido *
                    </label>
                    <input
                        type="text"
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        className="border-paper-dark bg-paper text-ink placeholder-stone-400 focus:ring-forest/25 focus:border-forest block w-full rounded-md border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
                        required
                    />
                </div>

                {/* DNI / CUIT */}
                <div>
                    <label
                        htmlFor="customerDni"
                        className="text-ink-muted mb-1.5 block text-xs font-bold tracking-wider uppercase"
                    >
                        DNI o CUIT *
                    </label>
                    <input
                        type="text"
                        id="customerDni"
                        value={customerDni}
                        onChange={(e) => setCustomerDni(e.target.value)}
                        placeholder="Ej: 35123456"
                        className="border-paper-dark bg-paper text-ink placeholder-stone-400 focus:ring-forest/25 focus:border-forest block w-full rounded-md border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
                        required
                    />
                </div>

                {/* Teléfono de Contacto */}
                <div>
                    <label
                        htmlFor="customerPhone"
                        className="text-ink-muted mb-1.5 block text-xs font-bold tracking-wider uppercase"
                    >
                        Teléfono Móvil (WhatsApp) *
                    </label>
                    <input
                        type="tel"
                        id="customerPhone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ej: 5493875112233"
                        className="border-paper-dark bg-paper text-ink placeholder-stone-400 focus:ring-forest/25 focus:border-forest block w-full rounded-md border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
                        required
                    />
                </div>

                {/* Correo Electrónico */}
                <div>
                    <label
                        htmlFor="customerEmail"
                        className="text-ink-muted mb-1.5 block text-xs font-bold tracking-wider uppercase"
                    >
                        Correo Electrónico *
                    </label>
                    <input
                        type="email"
                        id="customerEmail"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="Ej: juan.perez@ejemplo.com"
                        className="border-paper-dark bg-paper text-ink placeholder-stone-400 focus:ring-forest/25 focus:border-forest block w-full rounded-md border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
                        required
                    />
                </div>
            </div>

            <div className="border-paper-dark flex justify-between gap-4 border-t pt-4">
                <ButtonEditorial type="button" variant="ghost" onClick={onBack} className="text-sm font-semibold">
                    ← Atrás
                </ButtonEditorial>
                <ButtonEditorial type="submit" className="text-sm font-semibold">
                    Revisar Pedido →
                </ButtonEditorial>
            </div>
        </form>
    );
}

export default StepCustomer;
