import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import type { Book } from '../../types/alma';

interface QuickStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    initialStock?: number;
    onSave?: (newStock: number) => Promise<void> | void;
    isPending?: boolean;
    // Legacy support for Book
    book?: Book | null;
}

export function QuickStockModal({
    isOpen,
    onClose,
    title,
    subtitle,
    initialStock,
    onSave,
    isPending = false,
    book,
}: QuickStockModalProps) {
    const [localStock, setLocalStock] = useState<number>(0);
    const [isInternalProcessing, setIsInternalProcessing] = useState<boolean>(false);

    const resolvedTitle = title ?? book?.title ?? 'Producto';
    const resolvedSubtitle = subtitle ?? (book ? `ISBN: ${book.isbn}` : undefined);
    const effectiveStock = initialStock ?? book?.stock ?? 0;

    useEffect(() => {
        if (isOpen) {
            setLocalStock(effectiveStock);
        }
    }, [effectiveStock, isOpen]);

    if (!isOpen) return null;

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

    const handleSaveAction = async () => {
        if (onSave) {
            try {
                setIsInternalProcessing(true);
                await onSave(localStock);
                setIsInternalProcessing(false);
                onClose();
            } catch {
                setIsInternalProcessing(false);
            }
        } else if (book) {
            setIsInternalProcessing(true);
            router.patch(
                `/admin/libros/${book.id}/stock`,
                { stock: localStock },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsInternalProcessing(false);
                        onClose();
                    },
                    onError: () => {
                        setIsInternalProcessing(false);
                    },
                },
            );
        }
    };

    const processing = isPending || isInternalProcessing;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs animate-fade-in">
            <div
                className="bg-paper border-paper-dark w-full max-w-sm space-y-6 rounded-2xl border p-6 shadow-2xl"
                role="dialog"
                aria-modal="true"
            >
                <div className="space-y-1 text-center">
                    <h3 className="text-ink font-serif text-lg font-bold">Actualizar Inventario</h3>
                    <p className="text-ink-muted truncate text-xs font-medium" title={resolvedTitle}>
                        {resolvedTitle}
                    </p>
                    {resolvedSubtitle && (
                        <p className="font-mono text-[11px] text-stone-400">{resolvedSubtitle}</p>
                    )}
                </div>

                {/* Tactile Adjuster Layout */}
                <div className="flex items-center justify-center space-x-6 py-2">
                    <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={localStock <= 0 || processing}
                        className="bg-paper-dark hover:bg-stone-200 border-stone-300 text-ink focus:ring-forest flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border text-2xl font-bold transition-all select-none focus:ring-2 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
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
                            disabled={processing}
                            className="text-ink focus:border-forest w-24 [appearance:textfield] border-b-2 border-stone-300 bg-transparent text-center font-mono text-4xl font-bold focus:ring-0 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            aria-label="Cantidad de stock"
                        />
                        <span className="text-ink-muted mt-1 text-xs font-medium">Unidades</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={processing}
                        className="bg-paper-dark hover:bg-stone-200 border-stone-300 text-ink focus:ring-forest flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border text-2xl font-bold transition-all select-none focus:ring-2 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Incrementar stock"
                    >
                        +
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="hover:bg-paper-dark text-ink-muted hover:text-ink flex-1 cursor-pointer rounded-xl border border-stone-300 py-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveAction}
                        disabled={processing}
                        className="bg-forest hover:bg-forest-light flex-1 cursor-pointer rounded-xl py-2.5 font-serif text-xs font-bold text-white shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {processing ? 'Guardando...' : 'Guardar Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuickStockModal;
