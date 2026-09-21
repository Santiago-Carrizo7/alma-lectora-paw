import { getItemSubtotal, type CartItem } from './cart-store';
import { formatPrice } from './price';

export interface WhatsAppOrderDetails {
    customerName: string;
    customerDni: string;
    customerPhone: string;
    customerEmail: string;
    postalCode?: string | null;
    address?: string | null;
}

export function buildWhatsAppUrl(
    details: WhatsAppOrderDetails,
    items: CartItem[],
    totalAmount: string | number,
    whatsappPhone: string = '5493875708557'
): string {
    const cleanPhone = whatsappPhone.replace(/\D/g, '');

    const lines: string[] = [
        '🛍️ *Nueva orden de compra — Alma Lectora*',
        '',
        '👤 *Datos del Cliente*',
        `Nombre: ${details.customerName}`,
        `DNI/CUIT: ${details.customerDni}`,
        `Teléfono: ${details.customerPhone}`,
        `Email: ${details.customerEmail}`,
        '',
        '📦 *Entrega/Envío*',
        `Código Postal: ${details.postalCode ? details.postalCode : 'A coordinar'}`,
        `Dirección: ${details.address ? details.address : 'A coordinar'}`,
        '',
        '🛍️ *Detalle del Pedido*',
        ...items.map((item) => {
            const itemSubtotal = getItemSubtotal(item);
            const authorPart = item.author ? ` (${item.author})` : '';
            return `• ${item.title}${authorPart} x${item.quantity} — ${formatPrice(itemSubtotal)}`;
        }),
        '',
        `💰 *Total de la Compra: ${formatPrice(totalAmount)}*`,
        '',
        '*Por favor, confirmame los datos para coordinar el pago y el envío.*',
    ];

    const encodedText = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
