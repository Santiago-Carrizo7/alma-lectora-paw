import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useCart } from '../../lib/cart-store';
import { formatPrice } from '../../lib/price';
import type { SharedData } from '../../types';
import { ButtonEditorial } from '../ui/button-editorial';
import { Drawer } from '../ui/drawer';
import { CartItem } from './cart-item';

export function CartDrawer() {
    const { props } = usePage<SharedData>();
    const storeConfig = props.storeConfig;
    const { items, isOpen, closeCart, totalItems, totalAmount, syncStocks, setStockWarnings } = useCart();

    const [isVerifying, setIsVerifying] = useState(false);
    const [footerError, setFooterError] = useState<string | null>(null);
    const [storeClosedWarning, setStoreClosedWarning] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setFooterError(null);
            setStoreClosedWarning(null);
            return;
        }

        if (items.length === 0) return;

        const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
        fetch('/carrito/verificar-stock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify({
                items: items.map((i) => ({
                    id: i.id,
                    type: i.type,
                    quantity: i.quantity,
                })),
            }),
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data?.items) return;
                const stockMap: Record<string, number> = {};
                for (const key of Object.keys(data.items)) {
                    stockMap[key] = Number(data.items[key].available_stock ?? 0);
                }
                syncStocks(stockMap);
            })
            .catch(() => {
                // Silent background sync
            });
    }, [isOpen]);

    const handleCheckoutClick = async () => {
        setFooterError(null);
        setStoreClosedWarning(null);

        const isStoreOpen = storeConfig?.is_store_open ?? storeConfig?.isStoreOpen ?? true;
        if (!isStoreOpen) {
            setStoreClosedWarning(
                'En estos momentos no estamos recibiendo pedidos por WhatsApp. La tienda se encuentra temporalmente cerrada.'
            );
            return;
        }

        if (items.length === 0 || isVerifying) return;

        setIsVerifying(true);
        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const response = await fetch('/carrito/verificar-stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    items: items.map((i) => ({
                        id: i.id,
                        type: i.type,
                        quantity: i.quantity,
                    })),
                }),
            });

            if (!response.ok) {
                setFooterError('No pudimos verificar el stock disponible en este momento. Intentá nuevamente.');
                return;
            }

            const data = await response.json();

            if (data.items) {
                const stockMap: Record<string, number> = {};
                for (const key of Object.keys(data.items)) {
                    stockMap[key] = Number(data.items[key].available_stock ?? 0);
                }
                syncStocks(stockMap);
            }

            if (data.is_store_open === false) {
                setStoreClosedWarning(
                    'En estos momentos no estamos recibiendo pedidos por WhatsApp. La tienda se encuentra temporalmente cerrada.'
                );
                return;
            }

            if (!data.valid && data.items) {
                const warnings: Record<string, string> = {};
                for (const key of Object.keys(data.items)) {
                    const row = data.items[key];
                    if (!row.valid && row.message) {
                        warnings[key] = row.message;
                    }
                }
                setStockWarnings(warnings);
                setFooterError(
                    'Algunos productos superan el stock disponible actual. Ajustá las cantidades marcadas para continuar.'
                );
                return;
            }

            setStockWarnings({});
            closeCart();
            router.visit('/checkout');
        } catch {
            setFooterError('No se pudo conectar con el servidor para verificar el stock. Intentá nuevamente.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Drawer isOpen={isOpen} onClose={closeCart} title="Carrito de Compras">
            {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                    <svg
                        className="h-16 w-16 text-stone-300"
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
                    <h3 className="text-ink mt-4 font-serif text-base font-bold">Carrito Vacío</h3>
                    <p className="mt-1 max-w-[240px] text-xs text-stone-500">
                        Todavía no agregaste ningún producto a tu orden de compra.
                    </p>
                    <ButtonEditorial
                        variant="ghost"
                        size="sm"
                        onClick={closeCart}
                        className="text-forest mt-6 font-semibold underline"
                    >
                        Volver al catálogo
                    </ButtonEditorial>
                </div>
            ) : (
                <div className="flex h-full flex-col justify-between">
                    {/* Items List */}
                    <div className="divide-paper-dark flex-1 divide-y overflow-y-auto pr-1">
                        {items.map((item) => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </div>

                    {/* Checkout Footer */}
                    <div className="border-paper-dark bg-paper mt-6 shrink-0 border-t pt-4">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-ink-muted text-sm font-semibold">
                                Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
                            </span>
                            <span className="text-amber font-mono text-lg font-bold">
                                {formatPrice(totalAmount)}
                            </span>
                        </div>

                        {storeClosedWarning && (
                            <div className="animate-fade-in mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-950">
                                ⚠️ {storeClosedWarning}
                            </div>
                        )}

                        {footerError && (
                            <div className="animate-fade-in mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                                {footerError}
                            </div>
                        )}

                        <p className="mb-4 text-[11px] leading-tight text-stone-500 italic">
                            Los costos de envío y detalles de pago se coordinan directamente en el chat de WhatsApp.
                        </p>

                        <ButtonEditorial
                            onClick={handleCheckoutClick}
                            isLoading={isVerifying}
                            disabled={isVerifying}
                            className="w-full justify-center gap-2 py-3 text-sm font-semibold"
                        >
                            Completar Datos de Envío
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </ButtonEditorial>
                    </div>
                </div>
            )}
        </Drawer>
    );
}

export default CartDrawer;
