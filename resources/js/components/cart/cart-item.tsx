import { useEffect, useState } from 'react';
import { getItemSubtotal, useCart, type CartItem as CartItemType } from '../../lib/cart-store';
import { formatPrice } from '../../lib/price';
import { SafeImage } from '../ui/safe-image';

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const { incrementItem, decrementItem, removeItem, updateItemStock, stockWarnings, clearItemWarning } = useCart();
    const [inlineWarning, setInlineWarning] = useState<string | null>(null);
    const [isCheckingStock, setIsCheckingStock] = useState(false);

    useEffect(() => {
        if (inlineWarning) {
            const timer = setTimeout(() => setInlineWarning(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [inlineWarning]);

    const itemTotal = formatPrice(getItemSubtotal(item));
    const persistentWarning = stockWarnings[item.id];

    const getPlaceholderLabel = () => {
        switch (item.type) {
            case 'BOOK':
                return 'Libro';
            case 'ACCESSORY':
                return 'Accesorio';
            case 'COMBO':
                return 'Combo';
            default:
                return 'Producto';
        }
    };

    const formatStockLimitWarning = (available: number) => {
        if (available <= 0) {
            return 'Sin stock disponible';
        }
        if (available === 1) {
            return 'Solamente nos queda 1 unidad disponible';
        }
        return `Solamente nos quedan ${available} unidades disponibles`;
    };

    const handleDecrement = () => {
        if (item.quantity <= 1) {
            setInlineWarning('No podés comprar 0 unidades. Usá el ícono de papelera para eliminar.');
            return;
        }
        const nextQty = item.quantity - 1;
        decrementItem(item.id);
        if (nextQty <= item.stock) {
            clearItemWarning(item.id);
            setInlineWarning(null);
        }
    };

    const handleIncrement = async () => {
        if (isCheckingStock) return;

        if (item.stock !== undefined && item.quantity >= item.stock) {
            setInlineWarning(formatStockLimitWarning(item.stock));
            return;
        }

        setIsCheckingStock(true);
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
                    items: [
                        {
                            id: item.id,
                            type: item.type,
                            quantity: item.quantity + 1,
                        },
                    ],
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const itemCheck = data.items?.[item.id];
                if (itemCheck) {
                    const realStock = Number(itemCheck.available_stock ?? item.stock);
                    updateItemStock(item.id, realStock);

                    if (item.quantity + 1 > realStock) {
                        setInlineWarning(itemCheck.message || formatStockLimitWarning(realStock));
                        return;
                    }
                }
            }
            incrementItem(item.id);
        } catch {
            if (item.quantity < item.stock) {
                incrementItem(item.id);
            } else {
                setInlineWarning(formatStockLimitWarning(item.stock));
            }
        } finally {
            setIsCheckingStock(false);
        }
    };

    return (
        <div className="border-paper-dark border-b py-4">
            <div className="flex gap-4">
                {/* Product Cover Thumbnail */}
                <div className="bg-paper-dark border-paper-dark flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border shadow-xs">
                    <SafeImage
                        src={item.coverUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        fallback={
                            <div className="text-ink-muted flex h-full w-full flex-col items-center justify-center p-1 text-center font-serif text-[10px] italic">
                                {getPlaceholderLabel()}
                            </div>
                        }
                    />
                </div>

                {/* Product Details & Adjusters */}
                <div className="flex flex-1 flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between">
                            <h4 className="text-ink line-clamp-2 pr-2 text-sm leading-tight font-bold">{item.title}</h4>
                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="cursor-pointer rounded p-0.5 text-stone-400 transition-colors hover:text-red-700"
                                title="Eliminar producto"
                                aria-label={`Eliminar ${item.title}`}
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        {item.author && <p className="text-ink-muted mt-0.5 text-xs italic">{item.author}</p>}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        {/* Quantity Selector */}
                        <div className="bg-paper relative flex items-center rounded border border-stone-300">
                            <button
                                type="button"
                                onClick={handleDecrement}
                                className="hover:bg-paper-dark cursor-pointer px-2 py-0.5 text-stone-600 transition-colors"
                                aria-label="Disminuir cantidad"
                            >
                                -
                            </button>
                            <span className="text-ink px-2.5 py-0.5 font-mono text-xs font-semibold">{item.quantity}</span>
                            <button
                                type="button"
                                onClick={handleIncrement}
                                disabled={isCheckingStock}
                                className="hover:bg-paper-dark cursor-pointer px-2 py-0.5 text-stone-600 transition-colors disabled:opacity-50"
                                aria-label="Aumentar cantidad"
                            >
                                +
                            </button>
                        </div>

                        <span className="text-amber font-mono text-sm font-bold">{itemTotal}</span>
                    </div>
                </div>
            </div>

            {inlineWarning && (
                <div className="animate-fade-in mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-900">
                    {inlineWarning}
                </div>
            )}

            {persistentWarning && (
                <div className="animate-fade-in mt-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-700">
                    ⚠️ {persistentWarning}
                </div>
            )}
        </div>
    );
}

export default CartItem;
