import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
            <div
                className="bg-stone-900/40 backdrop-blur-xs fixed inset-0 transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 flex max-w-full">
                <div className="bg-paper border-paper-dark flex h-full w-screen max-w-md flex-col justify-between border-l shadow-2xl animate-slide-in-right">
                    <div className="border-paper-dark flex shrink-0 items-center justify-between border-b px-6 py-5">
                        <h2 className="text-ink text-xl font-bold tracking-tight">{title}</h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-ink-muted hover:text-ink hover:bg-paper-dark cursor-pointer rounded-md p-1.5 transition-colors focus:outline-none"
                            aria-label="Cerrar panel"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default Drawer;
