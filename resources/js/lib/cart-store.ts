import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProductType = 'BOOK' | 'ACCESSORY' | 'COMBO';

export interface CartItem {
    id: string;
    type: ProductType;
    title: string;
    author?: string;
    coverUrl?: string | null;
    price: string | number;
    promoQuantity?: number | null;
    promoPrice?: string | number | null;
    quantity: number;
    stock: number;
}

export function getItemSubtotal(item: CartItem): number {
    const unitPrice = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price);
    const pPrice = item.promoPrice ? (typeof item.promoPrice === 'string' ? parseFloat(item.promoPrice) : Number(item.promoPrice)) : 0;
    const pQty = item.promoQuantity ? Number(item.promoQuantity) : 0;

    if (pQty > 0 && pPrice > 0 && item.quantity >= pQty) {
        const bundles = Math.floor(item.quantity / pQty);
        const remainder = item.quantity % pQty;
        return bundles * pPrice + remainder * unitPrice;
    }

    return unitPrice * item.quantity;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

interface CartActions {
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeItem: (id: string) => void;
    incrementItem: (id: string) => void;
    decrementItem: (id: string) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
}

export type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],
            isOpen: false,

            addItem: (incoming) =>
                set((state) => {
                    if (incoming.stock <= 0) {
                        return state;
                    }
                    const existing = state.items.find((i) => i.id === incoming.id);
                    const addQty = incoming.quantity ?? 1;

                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.id === incoming.id
                                    ? {
                                          ...i,
                                          quantity: Math.min(i.quantity + addQty, i.stock),
                                      }
                                    : i
                            ),
                        };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                ...incoming,
                                quantity: Math.min(addQty, incoming.stock),
                            },
                        ],
                    };
                }),

            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                })),

            incrementItem: (id) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id
                            ? {
                                  ...i,
                                  quantity: i.quantity < i.stock ? i.quantity + 1 : i.quantity,
                              }
                            : i
                    ),
                })),

            decrementItem: (id) =>
                set((state) => ({
                    items: state.items
                        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
                        .filter((i) => i.quantity > 0),
                })),

            clearCart: () => set({ items: [] }),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
        }),
        {
            name: 'alma-lectora-cart',
        }
    )
);

export function useCart() {
    const items = useCartStore((state) => state.items);
    const isOpen = useCartStore((state) => state.isOpen);
    const addItem = useCartStore((state) => state.addItem);
    const removeItem = useCartStore((state) => state.removeItem);
    const incrementItem = useCartStore((state) => state.incrementItem);
    const decrementItem = useCartStore((state) => state.decrementItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const openCart = useCartStore((state) => state.openCart);
    const closeCart = useCartStore((state) => state.closeCart);

    const totalItems = useMemo(
        () => items.reduce((acc, item) => acc + item.quantity, 0),
        [items]
    );

    const totalAmount = useMemo(
        () => items.reduce((acc, item) => acc + getItemSubtotal(item), 0).toFixed(2),
        [items]
    );

    return {
        items,
        isOpen,
        totalItems,
        totalAmount,
        addItem,
        removeItem,
        incrementItem,
        decrementItem,
        clearCart,
        openCart,
        closeCart,
    };
}
