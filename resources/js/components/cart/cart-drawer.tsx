import { router } from '@inertiajs/react';
import { useCart } from '../../lib/cart-store';
import { formatPrice } from '../../lib/price';
import { ButtonEditorial } from '../ui/button-editorial';
import { Drawer } from '../ui/drawer';
import { CartItem } from './cart-item';

export function CartDrawer() {
    const { items, isOpen, closeCart, totalItems, totalAmount } = useCart();

    const handleCheckoutClick = () => {
        closeCart();
        router.visit('/checkout');
    };

    return (
        <Drawer isOpen={isOpen} onClose={closeCart} title="Carrito de Compras">
            {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                    <svg
                        className="text-stone-300 h-16 w-16"
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
                    <h3 className="text-ink font-serif mt-4 text-base font-bold">Carrito Vacío</h3>
                    <p className="text-stone-500 mt-1 max-w-[240px] text-xs">
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
                    <div className="flex-1 divide-y divide-paper-dark overflow-y-auto pr-1">
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

                        <p className="text-stone-500 mb-4 text-[11px] leading-tight italic">
                            Los costos de envío y detalles de pago se coordinan directamente en el chat de WhatsApp.
                        </p>

                        <ButtonEditorial
                            onClick={handleCheckoutClick}
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
