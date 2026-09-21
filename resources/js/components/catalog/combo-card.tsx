import { router } from '@inertiajs/react';
import React from 'react';
import { useCart } from '../../lib/cart-store';
import { formatPrice } from '../../lib/price';
import type { Combo } from '../../types/alma';
import { ButtonEditorial } from '../ui/button-editorial';

interface ComboCardProps {
    combo: Combo;
    onAdd?: (combo: Combo) => void;
    onClick?: () => void;
}

export function ComboCard({ combo, onAdd, onClick }: ComboCardProps) {
    const { addItem, openCart } = useCart();
    const cover = combo.coverUrl || combo.cover_url;
    const isOutOfStock = combo.stock === 0;

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isOutOfStock) return;
        if (onAdd) {
            onAdd(combo);
        } else {
            addItem({
                id: combo.id,
                type: 'COMBO',
                title: combo.title,
                coverUrl: cover,
                price: combo.price,
                promoQuantity: combo.promoQuantity || combo.promo_quantity,
                promoPrice: combo.promoPrice || combo.promo_price,
                stock: combo.stock,
            });
            openCart();
        }
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.visit(`/combos/${combo.id}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="group rounded-card border-paper-dark hover:border-forest/20 bg-paper-dark/30 relative flex h-full cursor-pointer flex-col justify-between overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
        >
            <div className="bg-paper-dark relative flex aspect-[16/10] items-center justify-center overflow-hidden sm:aspect-[4/3]">
                {cover ? (
                    <img
                        src={cover}
                        alt={combo.title}
                        loading="lazy"
                        decoding="async"
                        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                            isOutOfStock ? 'grayscale opacity-60' : ''
                        }`}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">🎁</div>
                )}
                <span className="bg-amber text-stone-100 absolute top-2 left-2 z-10 rounded px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase shadow-xs sm:text-[10px]">
                    OFERTA COMBO
                </span>
            </div>
            <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
                <div>
                    <h4
                        className="text-ink group-hover:text-forest line-clamp-1 font-serif text-sm font-bold leading-snug transition-colors duration-200 sm:text-base"
                        title={combo.title}
                    >
                        {combo.title}
                    </h4>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-amber shrink-0 font-mono text-xs font-bold whitespace-nowrap min-[360px]:text-sm sm:text-base">
                        {formatPrice(combo.price)}
                    </span>
                    <ButtonEditorial
                        size="sm"
                        onClick={handleAdd}
                        disabled={isOutOfStock}
                        aria-label={`Agregar combo ${combo.title} al carrito`}
                        className="shrink-0 px-3 py-1.5 text-xs font-semibold"
                    >
                        {isOutOfStock ? 'Agotado' : 'Agregar'}
                    </ButtonEditorial>
                </div>
            </div>
        </div>
    );
}

export default ComboCard;
