import { Head, Link } from '@inertiajs/react';
import { PageShell } from '../../../layouts/page-shell';
import { formatPrice } from '../../../lib/price';
import { buildWhatsAppUrl } from '../../../lib/whatsapp';

interface OrderItemData {
    id: string;
    type: 'BOOK' | 'ACCESSORY' | 'COMBO';
    title: string;
    quantity: number;
    unit_price: number;
    author?: string;
}

interface OrderRecord {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    customer_dni: string;
    postal_code: string | null;
    address: string | null;
    items: OrderItemData[];
    total_amount: number | string;
    status: 'PENDING_WHATSAPP' | 'CONFIRMED' | 'CANCELLED';
    created_at: string;
}

interface PaginatedOrders {
    data: OrderRecord[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface CustomerOrdersProps {
    orders: PaginatedOrders;
    whatsappPhone: string;
}

export default function CustomerOrders({ orders, whatsappPhone }: CustomerOrdersProps) {
    const getStatusBadge = (status: OrderRecord['status']) => {
        switch (status) {
            case 'CONFIRMED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Confirmado / Pagado
                    </span>
                );
            case 'PENDING_WHATSAPP':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        Pendiente WhatsApp
                    </span>
                );
            case 'CANCELLED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Cancelado
                    </span>
                );
        }
    };

    const handleWhatsAppRedirect = (order: OrderRecord) => {
        const cartItems = (order.items || []).map((it) => ({
            id: it.id,
            type: it.type,
            title: it.title,
            price: it.unit_price,
            quantity: it.quantity,
            author: it.author,
            stock: 99,
        }));

        const url = buildWhatsAppUrl(
            {
                customerName: order.customer_name,
                customerDni: order.customer_dni,
                customerPhone: order.customer_phone,
                customerEmail: order.customer_email,
                postalCode: order.postal_code,
                address: order.address,
            },
            cartItems,
            order.total_amount,
            whatsappPhone
        );

        window.open(url, '_blank');
    };

    return (
        <PageShell>
            <Head title="Mis Compras | Alma Lectora" />

            <div className="mx-auto max-w-4xl py-6 sm:py-10 animate-fade-in space-y-6">
                {/* Encabezado */}
                <div className="border-b border-paper-dark/60 pb-6">
                    <h1 className="text-ink font-serif text-2xl sm:text-3xl font-bold">Mis Compras</h1>
                    <p className="text-ink-muted text-xs sm:text-sm mt-1">
                        Historial de pedidos realizados, estado de preparación y comprobantes de compra.
                    </p>
                </div>

                {/* Listado de Pedidos */}
                {orders.data.length > 0 ? (
                    <div className="space-y-4">
                        {orders.data.map((order) => {
                            const shortId = order.id.substring(0, 8).toUpperCase();
                            const formattedDate = new Date(order.created_at).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <div
                                    key={order.id}
                                    className="bg-paper border border-paper-dark/60 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-forest/40 transition-all space-y-4"
                                >
                                    {/* Cabecera de la Orden */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-paper-dark/40 pb-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-xs font-bold text-forest">
                                                    Orden #{shortId}
                                                </span>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <p className="text-ink-muted text-xs mt-1">
                                                Fecha de pedido: {formattedDate}
                                            </p>
                                        </div>

                                        <div className="sm:text-right">
                                            <span className="text-[11px] text-ink-muted uppercase font-bold tracking-wider">Total</span>
                                            <p className="text-ink font-serif text-lg sm:text-xl font-bold text-forest">
                                                {formatPrice(order.total_amount)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detalle de Productos */}
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-serif font-bold text-ink uppercase tracking-wider">
                                            Productos ({order.items?.length || 0})
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {order.items?.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-paper-light border border-paper-dark/40 rounded-xl px-3 py-2 text-xs flex items-center justify-between"
                                                >
                                                    <div className="truncate pr-2">
                                                        <span className="font-medium text-ink">{item.title}</span>
                                                        <span className="text-ink-muted text-[11px] ml-1">x{item.quantity}</span>
                                                    </div>
                                                    <span className="font-mono font-semibold text-ink shrink-0">
                                                        {formatPrice(item.unit_price * item.quantity)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-paper-dark/40">
                                        {/* Botón WhatsApp si está pendiente */}
                                        {order.status === 'PENDING_WHATSAPP' && (
                                            <button
                                                type="button"
                                                onClick={() => handleWhatsAppRedirect(order)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.01-.069-.253-.082-.581-.205-.992-.381-1.748-.748-2.883-2.518-2.971-2.635-.088-.117-.714-.95-.714-1.815 0-.865.454-1.29.615-1.465.162-.175.353-.219.47-.219.118 0 .236.002.338.007.108.006.254-.041.397.303.148.356.505 1.233.549 1.323.044.09.073.195.015.312-.059.117-.089.19-.176.293-.088.102-.185.228-.264.306-.088.088-.179.184-.077.36.103.175.457.755.981 1.222.674.601 1.242.788 1.417.876.176.088.279.073.382-.044.103-.117.44-.512.558-.687.117-.175.235-.147.397-.088.161.059 1.028.485 1.205.573.176.088.294.132.338.205.044.074.044.426-.1.831z"/>
                                                </svg>
                                                Reabrir WhatsApp
                                            </button>
                                        )}

                                        {/* Descarga de Comprobante / Remito PDF */}
                                        <a
                                            href={`/mis-compras/${order.id}/remito`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-forest/10 hover:bg-forest/20 text-forest border border-forest/30 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                            </svg>
                                            Descargar Comprobante (PDF)
                                        </a>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Paginación */}
                        {orders.last_page > 1 && (
                            <div className="flex justify-center gap-1 pt-4">
                                {orders.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                            link.active
                                                ? 'bg-forest text-stone-100 font-bold'
                                                : link.url
                                                ? 'hover:bg-paper-dark text-ink'
                                                : 'text-stone-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Estado Vacío */
                    <div className="bg-paper border border-paper-dark/60 rounded-2xl p-12 text-center space-y-4 shadow-xs">
                        <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto text-forest">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                        </div>
                        <h3 className="text-ink font-serif text-lg font-bold">Aún no registrás compras</h3>
                        <p className="text-ink-muted text-xs max-w-sm mx-auto">
                            Cuando realices tu primer pedido en Alma Lectora, vas a poder seguir el estado de tu compra y descargar tus remitos desde aquí.
                        </p>
                        <Link
                            href="/libros"
                            className="inline-block bg-forest text-stone-100 hover:bg-forest-dark text-xs font-serif font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors mt-2"
                        >
                            Explorar Catálogo de Libros
                        </Link>
                    </div>
                )}
            </div>
        </PageShell>
    );
}
