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
    stockWarnings: Record<string, string>;
}

interface CartActions {
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    removeItem: (id: string) => void;
    incrementItem: (id: string) => void;
    decrementItem: (id: string) => void;
    updateItemStock: (id: string, stock: number) => void;
    syncStocks: (stockMap: Record<string, number>) => void;
    setStockWarnings: (warnings: Record<string, string>) => void;
    clearItemWarning: (id: string) => void;
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
            stockWarnings: {},

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
                                          stock: incoming.stock,
                                          quantity: Math.min(i.quantity + addQty, incoming.stock),
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
                set((state) => {
                    const nextWarnings = { ...state.stockWarnings };
                    delete nextWarnings[id];
                    return {
                        items: state.items.filter((i) => i.id !== id),
                        stockWarnings: nextWarnings,
                    };
                }),

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
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
                    ),
                })),

            updateItemStock: (id, stock) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, stock } : i
                    ),
                })),

            syncStocks: (stockMap) =>
                set((state) => ({
                    items: state.items.map((i) => {
                        if (stockMap[i.id] === undefined) return i;
                        const updatedStock = stockMap[i.id];
                        return {
                            ...i,
                            stock: updatedStock,
                            quantity: updatedStock > 0 ? Math.min(i.quantity, updatedStock) : i.quantity,
                        };
                    }),
                })),

            setStockWarnings: (warnings) => set({ stockWarnings: warnings }),

            clearItemWarning: (id) =>
                set((state) => {
                    if (!state.stockWarnings[id]) return state;
                    const next = { ...state.stockWarnings };
                    delete next[id];
                    return { stockWarnings: next };
                }),

            clearCart: () => set({ items: [], stockWarnings: {} }),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
        }),
        {
            name: 'alma-lectora-cart',
            partialize: (state) => ({ items: state.items }),
        }
    )
);

export function useCart() {
    const items = useCartStore((state) => state.items);
    const isOpen = useCartStore((state) => state.isOpen);
    const stockWarnings = useCartStore((state) => state.stockWarnings);
    const addItem = useCartStore((state) => state.addItem);
    const removeItem = useCartStore((state) => state.removeItem);
    const incrementItem = useCartStore((state) => state.incrementItem);
    const decrementItem = useCartStore((state) => state.decrementItem);
    const updateItemStock = useCartStore((state) => state.updateItemStock);
    const syncStocks = useCartStore((state) => state.syncStocks);
    const setStockWarnings = useCartStore((state) => state.setStockWarnings);
    const clearItemWarning = useCartStore((state) => state.clearItemWarning);
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
        stockWarnings,
        totalItems,
        totalAmount,
        addItem,
        removeItem,
        incrementItem,
        decrementItem,
        updateItemStock,
        syncStocks,
        setStockWarnings,
        clearItemWarning,
        clearCart,
        openCart,
        closeCart,
    };
}
