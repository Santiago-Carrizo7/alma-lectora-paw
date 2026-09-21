import React, { useState } from 'react';
import type { ShippingFormData } from '../../types/alma';
import { ButtonEditorial } from '../ui/button-editorial';

interface StepShippingProps {
    initialData: ShippingFormData | null;
    onNext: (data: ShippingFormData) => void;
    onCancel: () => void;
}

export function StepShipping({ initialData, onNext, onCancel }: StepShippingProps) {
    const [postalCode, setPostalCode] = useState(initialData?.postalCode ?? '');
    const [address, setAddress] = useState(initialData?.address ?? '');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!postalCode.trim() || !address.trim()) {
            setError('Por favor completá los campos de código postal y dirección.');
            return;
        }
        setError('');
        onNext({ postalCode: postalCode.trim(), address: address.trim() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-ink font-serif text-lg font-bold">1. Información de Envío</h3>
                <p className="text-stone-500 text-xs mt-1">
                    Ingresá tu código postal y domicilio para coordinar la entrega o retiro.
                </p>
            </div>

            {error && (
                <div className="border-red-200 bg-red-50 text-red-700 rounded-md border p-3 text-xs font-medium">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Código Postal */}
                <div>
                    <label
                        htmlFor="postalCode"
                        className="text-ink-muted mb-1.5 block text-xs font-bold tracking-wider uppercase"
                    >
                        Código Postal *
                    </label>
                    <input
                        type="text"
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Ej: 4400"
                        className="border-paper-dark bg-paper text-ink placeholder-stone-400 focus:ring-forest/25 focus:border-forest block w-full rounded-md border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
                        required
                    />
                </div>

                {/* Dirección Completa */}
                <div>
                    <label
                        htmlFor="address"
                        className="text-ink-muted mb-1.5 block text-xs font-bold tracking-wider uppercase"
                    >
                        Dirección Completa (Calle, Altura, Piso / Depto) *
                    </label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ej: Av. Belgrano 1234, 4to B"
                        className="border-paper-dark bg-paper text-ink placeholder-stone-400 focus:ring-forest/25 focus:border-forest block w-full rounded-md border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
                        required
                    />
                </div>
            </div>

            <div className="border-paper-dark flex justify-between gap-4 border-t pt-4">
                <ButtonEditorial type="button" variant="ghost" onClick={onCancel} className="text-sm font-semibold">
                    ← Volver a la Tienda
                </ButtonEditorial>
                <ButtonEditorial type="submit" className="text-sm font-semibold">
                    Siguiente paso →
                </ButtonEditorial>
            </div>
        </form>
    );
}

export default StepShipping;
