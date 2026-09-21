import { getItemSubtotal, useCart } from '../../lib/cart-store';
import { formatPrice } from '../../lib/price';
import type { CustomerFormData, ShippingFormData } from '../../types/alma';
import { ButtonEditorial } from '../ui/button-editorial';

interface StepSummaryProps {
    shipping: ShippingFormData;
    customer: CustomerFormData;
    onBack: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}

export function StepSummary({
    shipping,
    customer,
    onBack,
    onConfirm,
    isSubmitting,
}: StepSummaryProps) {
    const { items, totalItems, totalAmount } = useCart();

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h3 className="text-ink font-serif text-lg font-bold">3. Resumen y Confirmación</h3>
                <p className="text-stone-500 text-xs mt-1">
                    Revisá la información antes de generar la orden y continuar a WhatsApp.
                </p>
            </div>

            <div className="space-y-4">
                {/* Products List Review */}
                <div className="border-paper-dark bg-paper-dark/20 rounded-lg border p-4">
                    <h4 className="text-ink-muted mb-2 text-xs font-bold tracking-wider uppercase">
                        Productos Seleccionados
                    </h4>
                    <div className="divide-paper-dark max-h-56 divide-y overflow-y-auto pr-1">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                                <span className="text-ink font-medium">
                                    {item.title}{' '}
                                    <span className="text-ink-muted text-xs">x{item.quantity}</span>
                                </span>
                                <span className="text-amber font-mono font-semibold">
                                    {formatPrice(getItemSubtotal(item))}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="border-paper-dark text-ink mt-3 flex justify-between border-t pt-3 font-bold">
                        <span>Total ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})</span>
                        <span className="text-amber font-mono text-lg">{formatPrice(totalAmount)}</span>
                    </div>
                </div>

                {/* Shipping & Customer Data Review Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Customer Info */}
                    <div className="border-paper-dark bg-paper-dark/10 rounded-lg border p-4">
                        <h4 className="text-ink-muted mb-2 text-xs font-bold tracking-wider uppercase">
                            Datos del Cliente
                        </h4>
                        <div className="text-ink space-y-1 text-xs">
                            <p>
                                <span className="font-semibold">Nombre:</span> {customer.customerName}
                            </p>
                            <p>
                                <span className="font-semibold">DNI/CUIT:</span> {customer.customerDni}
                            </p>
                            <p>
                                <span className="font-semibold">Teléfono:</span> {customer.customerPhone}
                            </p>
                            <p>
                                <span className="font-semibold">Email:</span> {customer.customerEmail}
                            </p>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="border-paper-dark bg-paper-dark/10 rounded-lg border p-4">
                        <h4 className="text-ink-muted mb-2 text-xs font-bold tracking-wider uppercase">
                            Entrega y Domicilio
                        </h4>
                        <div className="text-ink space-y-1 text-xs">
                            <p>
                                <span className="font-semibold">Código Postal:</span> {shipping.postalCode}
                            </p>
                            <p>
                                <span className="font-semibold">Dirección:</span> {shipping.address}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-paper-dark flex flex-col justify-between gap-4 border-t pt-6 sm:flex-row">
                <ButtonEditorial
                    type="button"
                    variant="ghost"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="order-2 text-sm font-semibold sm:order-1"
                >
                    ← Modificar Datos
                </ButtonEditorial>
                <ButtonEditorial
                    type="button"
                    variant="whatsapp"
                    onClick={onConfirm}
                    isLoading={isSubmitting}
                    disabled={isSubmitting || items.length === 0}
                    className="order-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold sm:order-2"
                >
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.905-6.99C16.48 1.864 14.005.83 11.37.83c-5.442 0-9.866 4.42-9.87 9.865 0 1.636.494 3.232 1.428 4.816l-.993 3.626 3.712-.973zm11.026-6.19c-.3-.15-1.772-.875-2.046-.975-.276-.1-.476-.15-.676.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.487-.89-.794-1.49-1.77-1.665-2.07-.175-.3-.02-.462.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.63-1.01-2.435-.298-.717-.604-.622-.826-.63l-.678-.01c-.24 0-.63.09-1.01.5-.38.41-1.45 1.42-1.45 3.46 0 2.04 1.485 4.015 1.69 4.29.2.275 2.92 4.46 7.075 6.25 2.455 1.06 3.44.85 4.675.67 1.25-.19 2.766-.99 3.125-2.075.36-1.085.36-2.015.25-2.215-.1-.2-.3-.3-.6-.45z" />
                    </svg>
                    Confirmar y Enviar WhatsApp
                </ButtonEditorial>
            </div>
        </div>
    );
}

export default StepSummary;
