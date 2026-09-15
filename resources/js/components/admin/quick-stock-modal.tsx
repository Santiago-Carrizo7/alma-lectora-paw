import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
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
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-paper border border-paper-dark rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-6"
        role="dialog"
        aria-modal="true"
      >
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold font-serif text-ink">Actualizar Inventario</h3>
          <p className="text-xs text-ink-muted truncate font-medium">{book.title}</p>
          <p className="text-[11px] font-mono text-stone-400">ISBN: {book.isbn}</p>
        </div>

        {/* Tactile Adjuster Layout */}
        <div className="flex items-center justify-center space-x-6 py-2">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={localStock <= 0 || isProcessing}
            className="w-16 h-16 rounded-full bg-paper-dark/80 hover:bg-stone-200 border border-stone-300 text-2xl font-bold flex items-center justify-center text-ink select-none focus:outline-none focus:ring-2 focus:ring-forest active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
              className="text-4xl font-mono font-bold text-ink text-center w-24 bg-transparent border-b-2 border-stone-300 focus:border-forest focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Cantidad de stock"
            />
            <span className="text-xs text-ink-muted mt-1 font-medium">Unidades</span>
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={isProcessing}
            className="w-16 h-16 rounded-full bg-paper-dark/80 hover:bg-stone-200 border border-stone-300 text-2xl font-bold flex items-center justify-center text-ink select-none focus:outline-none focus:ring-2 focus:ring-forest active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
            className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl border border-stone-300 text-ink-muted hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-forest hover:bg-forest-light text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isProcessing ? 'Guardando...' : 'Guardar Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickStockModal;
