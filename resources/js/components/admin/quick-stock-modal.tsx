import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import type { Book } from '../../types/alma';

interface QuickStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    book: Book | null;
}

export function QuickStockModal({ isOpen, onClose, book }: QuickStockModalProps) {
    const [localStock, setLocalStock] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        if (book) {
            setLocalStock(book.stock ?? 0);
        }
    }, [book, isOpen]);

    if (!isOpen || !book) return null;

    const handleDecrement = () => {
        setLocalStock((prev) => Math.max(0, prev - 1));
    };

    const handleIncrement = () => {
        setLocalStock((prev) => prev + 1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 0) {
            setLocalStock(val);
        } else if (e.target.value === '') {
            setLocalStock(0);
        }
    };

    const handleSave = () => {
        setIsProcessing(true);
        router.patch(
            `/admin/libros/${book.id}/stock`,
            { stock: localStock },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsProcessing(false);
                    onClose();
                },
                onError: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    return (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="bg-paper border-paper-dark w-full max-w-sm space-y-6 rounded-2xl border p-6 shadow-xl" role="dialog" aria-modal="true">
                <div className="space-y-1 text-center">
                    <h3 className="text-ink font-serif text-lg font-bold">Actualizar Inventario</h3>
                    <p className="text-ink-muted truncate text-xs font-medium">{book.title}</p>
                    <p className="font-mono text-[11px] text-stone-400">ISBN: {book.isbn}</p>
                </div>

                {/* Tactile Adjuster Layout */}
                <div className="flex items-center justify-center space-x-6 py-2">
                    <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={localStock <= 0 || isProcessing}
                        className="bg-paper-dark/80 text-ink focus:ring-forest flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-stone-300 text-2xl font-bold transition-all select-none hover:bg-stone-200 focus:ring-2 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Disminuir stock"
                    >
                        -
                    </button>

                    <div className="flex flex-col items-center">
                        <input
                            type="number"
                            min="0"
                            value={localStock}
                            onChange={handleInputChange}
                            disabled={isProcessing}
                            className="text-ink focus:border-forest w-24 [appearance:textfield] border-b-2 border-stone-300 bg-transparent text-center font-mono text-4xl font-bold focus:ring-0 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            aria-label="Cantidad de stock"
                        />
                        <span className="text-ink-muted mt-1 text-xs font-medium">Unidades</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={isProcessing}
                        className="bg-paper-dark/80 text-ink focus:ring-forest flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-stone-300 text-2xl font-bold transition-all select-none hover:bg-stone-200 focus:ring-2 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Incrementar stock"
                    >
                        +
                    </button>
                </div>

                {/* Dialog Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="text-ink-muted flex-1 cursor-pointer rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-stone-200/50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isProcessing}
                        className="bg-forest hover:bg-forest-light flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? 'Guardando...' : 'Guardar Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuickStockModal;
