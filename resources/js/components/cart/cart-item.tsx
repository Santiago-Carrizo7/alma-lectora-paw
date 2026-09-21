import { useEffect, useState } from 'react';
import { getItemSubtotal, useCart, type CartItem as CartItemType } from '../../lib/cart-store';
import { formatPrice } from '../../lib/price';

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const { incrementItem, decrementItem, removeItem } = useCart();
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        if (showWarning) {
            const timer = setTimeout(() => setShowWarning(false), 2200);
            return () => clearTimeout(timer);
        }
    }, [showWarning]);

    const itemTotal = formatPrice(getItemSubtotal(item));

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

    const handleIncrement = () => {
        if (item.stock !== undefined && item.quantity >= item.stock) {
            setShowWarning(true);
        } else {
            incrementItem(item.id);
        }
    };

    return (
        <div className="border-paper-dark flex gap-4 border-b py-4">
            {/* Product Cover Thumbnail */}
            <div className="bg-paper-dark border-paper-dark flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border shadow-xs">
                {item.coverUrl ? (
                    <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                    <div className="text-ink-muted flex h-full w-full flex-col items-center justify-center p-1 text-center font-serif text-[10px] italic">
                        {getPlaceholderLabel()}
                    </div>
                )}
            </div>

            {/* Product Details & Adjusters */}
            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between">
                        <h4 className="text-ink line-clamp-2 pr-2 text-sm leading-tight font-bold">{item.title}</h4>
                        <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-stone-400 hover:text-red-700 transition-colors p-0.5 rounded cursor-pointer"
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
                            onClick={() => decrementItem(item.id)}
                            className="hover:bg-paper-dark cursor-pointer px-2 py-0.5 text-stone-600 transition-colors"
                            aria-label="Disminuir cantidad"
                        >
                            -
                        </button>
                        <span className="text-ink px-2.5 py-0.5 font-mono text-xs font-semibold">{item.quantity}</span>
                        <button
                            type="button"
                            onClick={handleIncrement}
                            className="hover:bg-paper-dark cursor-pointer px-2 py-0.5 text-stone-600 transition-colors"
                            aria-label="Aumentar cantidad"
                        >
                            +
                        </button>

                        {showWarning && (
                            <span className="animate-fade-in absolute top-full left-0 z-30 mt-1.5 whitespace-nowrap rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[9px] font-bold tracking-wider text-red-700 uppercase shadow-sm">
                                Solo {item.stock} disponibles
                            </span>
                        )}
                    </div>

                    <span className="text-amber font-mono text-sm font-bold">{itemTotal}</span>
                </div>
            </div>
        </div>
    );
}

export default CartItem;
