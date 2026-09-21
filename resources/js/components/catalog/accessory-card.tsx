import { Link } from '@inertiajs/react';
import React from 'react';
import { useCart } from '../../lib/cart-store';
import { formatPrice } from '../../lib/price';
import type { Accessory } from '../../types/alma';
import { ButtonEditorial } from '../ui/button-editorial';

interface AccessoryCardProps {
    accessory: Accessory;
    onAddToCart?: (accessory: Accessory) => void;
}

export const AccessoryCard = React.memo(function AccessoryCard({ accessory, onAddToCart }: AccessoryCardProps) {
    const { addItem, openCart } = useCart();
    const isOutOfStock = accessory.stock === 0;
    const cover = accessory.coverUrl || accessory.cover_url;
    const promoQty = accessory.promoQuantity || accessory.promo_quantity;
    const promoPrc = accessory.promoPrice || accessory.promo_price;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;
        if (onAddToCart) {
            onAddToCart(accessory);
        } else {
            addItem({
                id: accessory.id,
                type: 'ACCESSORY',
                title: accessory.title,
                coverUrl: cover,
                price: accessory.price,
                promoQuantity: promoQty,
                promoPrice: promoPrc,
                stock: accessory.stock,
            });
            openCart();
        }
    };

    return (
        <div
            className={`group bg-paper-dark/30 rounded-card border-paper-dark relative flex h-full flex-col overflow-hidden border transition-all duration-300 ${
                isOutOfStock ? 'cursor-default opacity-90' : 'hover:border-forest/30 hover:-translate-y-1 hover:shadow-lg'
            }`}
        >
            <Link
                href={`/accesorios/${accessory.id}`}
                aria-label={isOutOfStock ? `${accessory.title} - Agotado` : `Ver detalles de ${accessory.title}`}
                className="flex flex-1 flex-col"
            >
                <div className="bg-paper-dark relative flex aspect-square w-full items-center justify-center overflow-hidden shadow-inner">
                    {cover ? (
                        <img
                            src={cover}
                            alt={accessory.title}
                            loading="lazy"
                            decoding="async"
                            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                                isOutOfStock ? 'opacity-40 grayscale' : ''
                            }`}
                        />
                    ) : (
                        <div className="text-ink-muted flex h-full w-full flex-col items-center justify-center text-4xl">✨</div>
                    )}

                    {isOutOfStock && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-950/70 select-none">
                            <span className="rounded border border-stone-700/50 bg-stone-900/90 px-3 py-1 text-xs font-bold tracking-widest text-white uppercase shadow-sm">
                                Agotado
                            </span>
                        </div>
                    )}

                    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
                        {promoQty && promoPrc && (
                            <span className="bg-amber rounded px-2 py-0.5 font-sans text-[9px] font-bold tracking-wider text-white uppercase shadow-sm">
                                {promoQty}x{formatPrice(promoPrc)}
                            </span>
                        )}
                        <span className="bg-paper-dark/95 text-ink border-paper-dark rounded border px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase shadow-xs">
                            {accessory.category}
                        </span>
                    </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-3.5">
                    <div>
                        <h4
                            className="text-ink group-hover:text-forest line-clamp-2 text-sm leading-snug font-bold transition-colors duration-200"
                            title={accessory.title}
                        >
                            {accessory.title}
                        </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-1">
                        <span className="text-amber font-mono text-sm font-bold">{formatPrice(accessory.price)}</span>
                        <ButtonEditorial
                            size="sm"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            aria-label={isOutOfStock ? `${accessory.title} está agotado` : `Agregar ${accessory.title} al carrito`}
                            className="px-2.5 py-1 text-xs font-semibold"
                        >
                            {isOutOfStock ? 'Agotado' : 'Agregar'}
                        </ButtonEditorial>
                    </div>
                </div>
            </Link>
        </div>
    );
});

export default AccessoryCard;
