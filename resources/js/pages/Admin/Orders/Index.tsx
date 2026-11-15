import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BookThumbnail } from '../../../components/ui/book-thumbnail';
import { PaginationLinks } from '../../../components/ui/pagination-links';
import { AdminLayout } from '../../../layouts/admin-layout';
import { formatPrice } from '../../../lib/price';
import type { PaginatedData } from '../../../types/alma';

interface OrderItem {
    id?: string;
    title: string;
    type?: string;
    quantity: number;
    unitPrice?: number | string;
    unit_price?: number | string;
    subtotal?: number | string;
    coverUrl?: string | null;
    cover_url?: string | null;
}

interface OrderLeadItem {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    customer_dni: string;
    postal_code: string | null;
    address: string | null;
    items: OrderItem[];
    total_amount: number | string;
    status: 'PENDING_WHATSAPP' | 'CONFIRMED' | 'CANCELLED';
    created_at: string;
}

interface IndexProps {
    orders: PaginatedData<OrderLeadItem>;
    filters: {
        tab: 'PENDING_WHATSAPP' | 'CONFIRMED' | 'CANCELLED' | 'ALL';
        search: string;
    };
    counts: {
        PENDING_WHATSAPP: number;
        CONFIRMED: number;
        CANCELLED: number;
        ALL: number;
    };
}

interface ConfirmStatusState {
    orderId: string;
    customerName: string;
    fromStatus: 'PENDING_WHATSAPP' | 'CONFIRMED' | 'CANCELLED';
    status: 'PENDING_WHATSAPP' | 'CONFIRMED' | 'CANCELLED';
}

export function Index({ orders, filters, counts }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [confirmState, setConfirmState] = useState<ConfirmStatusState | null>(null);
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    '/admin/pedidos',
                    { search, tab: filters.tab },
                    { preserveState: true, replace: true, preserveScroll: true },
                );
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [search, filters.search, filters.tab]);

    const handleTabChange = (tab: string) => {
        router.get(
            '/admin/pedidos',
            { search, tab },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleConfirmStatus = () => {
        if (!confirmState) return;
        setConfirmError(null);
        setIsProcessing(true);
        router.patch(
            `/admin/pedidos/${confirmState.orderId}/estado`,
            { status: confirmState.status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmState(null);
                    setConfirmError(null);
                    setIsProcessing(false);
                },
                onError: (errors) => {
                    setIsProcessing(false);
                    const message =
                        errors.stock ||
                        errors.status ||
                        Object.values(errors)[0] ||
                        'No se pudo actualizar el estado del pedido.';
                    setConfirmError(message);
                },
            },
        );
    };

    const getWhatsAppUrl = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        const withCountryCode = cleaned.startsWith('54')
            ? cleaned
            : cleaned.length === 10
            ? `549${cleaned}`
            : cleaned;
        return `https://wa.me/${withCountryCode}`;
    };

    return (
        <AdminLayout
            title="Gestión de Pedidos"
            subtitle="Control de confirmaciones de compras, chat directo con clientes y registro"
            breadcrumbText="Volver al Panel Central"
            breadcrumbHref="/admin"
        >
            <Head title="Gestión de Pedidos - Admin" />

            <div className="space-y-6 animate-fade-in">
                {/* Search & Tabs Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative w-full sm:max-w-md">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por cliente, teléfono, DNI o email..."
                            className="bg-paper border-paper-dark focus:border-forest text-ink w-full rounded-xl border px-4 py-2.5 text-sm shadow-xs focus:ring-1 focus:ring-forest focus:outline-none"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="text-ink-muted hover:text-ink absolute inset-y-0 right-0 flex items-center pr-3"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="text-ink-muted text-xs shrink-0">
                        Total en esta vista: {orders.total} pedidos
                    </div>
                </div>

                {/* Mobile: Grilla 2x2 sin scroll horizontal */}
                <div className="grid grid-cols-2 gap-2 sm:hidden">
                    <button
                        type="button"
                        onClick={() => handleTabChange('PENDING_WHATSAPP')}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                            filters.tab === 'PENDING_WHATSAPP'
                                ? 'border-amber bg-amber/10 text-amber font-bold shadow-2xs'
                                : 'border-paper-dark bg-paper text-ink-muted hover:text-ink'
                        }`}
                    >
                        <span>Pendientes</span>
                        <span className="bg-amber/15 text-amber rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
                            {counts.PENDING_WHATSAPP}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('CONFIRMED')}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                            filters.tab === 'CONFIRMED'
                                ? 'border-forest bg-forest/10 text-forest font-bold shadow-2xs'
                                : 'border-paper-dark bg-paper text-ink-muted hover:text-ink'
                        }`}
                    >
                        <span>Confirmados</span>
                        <span className="bg-forest/15 text-forest rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
                            {counts.CONFIRMED}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('CANCELLED')}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                            filters.tab === 'CANCELLED'
                                ? 'border-red-500 bg-red-50 text-red-600 font-bold shadow-2xs'
                                : 'border-paper-dark bg-paper text-ink-muted hover:text-ink'
                        }`}
                    >
                        <span>Cancelados</span>
                        <span className="rounded-full bg-red-100 px-2 py-0.5 font-mono text-[10px] font-bold text-red-600">
                            {counts.CANCELLED}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('ALL')}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                            filters.tab === 'ALL'
                                ? 'border-stone-500 bg-stone-100 text-stone-800 font-bold shadow-2xs'
                                : 'border-paper-dark bg-paper text-ink-muted hover:text-ink'
                        }`}
                    >
                        <span>Todos</span>
                        <span className="rounded-full bg-stone-200 px-2 py-0.5 font-mono text-[10px] font-bold text-stone-700">
                            {counts.ALL}
                        </span>
                    </button>
                </div>

                {/* Desktop: Tabs */}
                <div className="border-paper-dark hidden border-b pb-1 gap-2 sm:flex">
                    <button
                        type="button"
                        onClick={() => handleTabChange('PENDING_WHATSAPP')}
                        className={`cursor-pointer px-4 py-2 text-xs font-semibold tracking-wide border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                            filters.tab === 'PENDING_WHATSAPP'
                                ? 'border-amber text-amber font-bold'
                                : 'border-transparent text-ink-muted hover:text-ink'
                        }`}
                    >
                        <span>Pendientes</span>
                        <span className="bg-amber/10 text-amber rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
                            {counts.PENDING_WHATSAPP}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('CONFIRMED')}
                        className={`cursor-pointer px-4 py-2 text-xs font-semibold tracking-wide border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                            filters.tab === 'CONFIRMED'
                                ? 'border-forest text-forest font-bold'
                                : 'border-transparent text-ink-muted hover:text-ink'
                        }`}
                    >
                        <span>Confirmados</span>
                        <span className="bg-forest/10 text-forest rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
                            {counts.CONFIRMED}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('CANCELLED')}
                        className={`cursor-pointer px-4 py-2 text-xs font-semibold tracking-wide border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                            filters.tab === 'CANCELLED'
                                ? 'border-red-500 text-red-600 font-bold'
                                : 'border-transparent text-ink-muted hover:text-ink'
                        }`}
                    >
                        <span>Cancelados</span>
                        <span className="bg-red-50 text-red-600 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
                            {counts.CANCELLED}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('ALL')}
                        className={`cursor-pointer px-4 py-2 text-xs font-semibold tracking-wide border-b-2 transition-all flex items-center gap-2 shrink-0 ${
                            filters.tab === 'ALL'
                                ? 'border-stone-500 text-stone-700 font-bold'
                                : 'border-transparent text-ink-muted hover:text-ink'
                        }`}
                    >
                        <span>Todos ({counts.ALL})</span>
                    </button>
                </div>

                {/* Orders Grid (Cards matching original) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.data.length === 0 ? (
                        <div className="col-span-full bg-paper-dark/20 border border-paper-dark border-dashed rounded-2xl p-12 text-center text-ink-muted italic">
                            No hay pedidos registrados en esta sección.
                        </div>
                    ) : (
                        orders.data.map((order) => {
                            const formattedDate = new Date(order.created_at).toLocaleString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <div
                                    key={order.id}
                                    className="bg-paper-dark/40 border-paper-dark/80 hover:border-paper-dark flex flex-col rounded-2xl border p-5 shadow-xs space-y-4 hover:shadow-md transition-all relative overflow-hidden"
                                >
                                    {/* Card Header */}
                                    <div className="border-paper-dark flex justify-between items-start border-b pb-3">
                                        <div>
                                            <span className="bg-paper-dark text-ink-muted rounded-full px-2 py-0.5 font-mono text-[10px] uppercase">
                                                ID: #{order.id.substring(0, 8)}
                                            </span>
                                            <div className="text-ink-muted font-sans text-[10px] mt-1 font-medium">
                                                {formattedDate}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`/admin/pedidos/${order.id}/remito`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Descargar / Imprimir Remito de Despacho en PDF"
                                                className="border-paper-dark hover:bg-paper-dark/60 text-ink-muted hover:text-forest bg-paper inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-colors shadow-2xs"
                                            >
                                                <svg className="text-forest h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                </svg>
                                                <span>Remito PDF</span>
                                            </a>
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                    order.status === 'PENDING_WHATSAPP'
                                                        ? 'bg-amber/10 text-amber border-amber/20'
                                                        : order.status === 'CONFIRMED'
                                                        ? 'bg-forest/10 text-forest border-forest/20'
                                                        : 'bg-red-50 text-red-700 border-red-100'
                                                }`}
                                            >
                                                {order.status === 'PENDING_WHATSAPP'
                                                    ? 'PENDIENTE WA'
                                                    : order.status === 'CONFIRMED'
                                                    ? 'CONFIRMADO'
                                                    : 'CANCELADO'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customer Information */}
                                    <div className="space-y-1.5 text-xs">
                                        <div className="text-ink font-serif text-sm font-bold">
                                            {order.customer_name}
                                        </div>
                                        <div className="text-ink-muted flex flex-wrap gap-x-3 gap-y-1">
                                            <span>
                                                <strong className="text-ink">DNI:</strong> {order.customer_dni}
                                            </span>
                                            <span>
                                                <strong className="text-ink">Email:</strong> {order.customer_email}
                                            </span>
                                        </div>
                                        {order.address && (
                                            <div className="text-ink-muted">
                                                <strong className="text-ink">Dirección:</strong> {order.address}
                                                {order.postal_code && ` (CP: ${order.postal_code})`}
                                            </div>
                                        )}

                                        {/* Direct WhatsApp Action */}
                                        <div className="pt-2">
                                            <a
                                                href={getWhatsAppUrl(order.customer_phone)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                                            >
                                                <svg
                                                    className="h-4 w-4 shrink-0"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                                                </svg>
                                                <span>Chatear (+{order.customer_phone.replace(/^\++/, '').trim()})</span>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Products Breakdown */}
                                    <div className="space-y-2 pt-2">
                                        <div className="text-ink text-[11px] font-bold uppercase tracking-wider">
                                            Productos Solicitados
                                        </div>
                                        <div className="divide-paper-dark/60 divide-y max-h-48 overflow-y-auto pr-1">
                                            {order.items?.map((item, idx) => {
                                                const unitPrice = item.unitPrice ?? item.unit_price ?? 0;
                                                const itemSubtotal =
                                                    item.subtotal !== undefined
                                                        ? parseFloat(String(item.subtotal))
                                                        : parseFloat(String(unitPrice)) * item.quantity;
                                                const cover = item.coverUrl ?? item.cover_url ?? null;

                                                return (
                                                    <div key={idx} className="flex items-center justify-between py-2 gap-3">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <BookThumbnail
                                                                src={cover}
                                                                title={item.title}
                                                                className="h-11 w-8 shrink-0 rounded border border-stone-200 object-cover shadow-xs"
                                                            />
                                                            <div className="min-w-0">
                                                                <div className="text-ink text-xs font-bold truncate max-w-[200px]">
                                                                    {item.title}
                                                                </div>
                                                                <div className="text-ink-muted text-[10px] mt-0.5">
                                                                    {item.type && `Tipo: ${item.type} | `} Cantidad: {item.quantity}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <div className="text-amber font-mono text-xs font-bold">
                                                                {formatPrice(itemSubtotal)}
                                                            </div>
                                                            <div className="text-ink-muted text-[9px]">
                                                                {formatPrice(unitPrice)} c/u
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Card Footer with Total & Actions */}
                                    <div className="border-paper-dark border-t pt-3 flex flex-col space-y-3 mt-auto">
                                        <div className="flex justify-between items-center">
                                            <span className="text-ink-muted text-xs font-semibold">
                                                Monto Total:
                                            </span>
                                            <span className="text-amber font-serif text-base font-extrabold">
                                                {formatPrice(order.total_amount)}
                                            </span>
                                        </div>

                                        {order.status === 'CONFIRMED' && (
                                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setConfirmError(null);
                                                        setConfirmState({
                                                            orderId: order.id,
                                                            customerName: order.customer_name,
                                                            fromStatus: 'CONFIRMED',
                                                            status: 'PENDING_WHATSAPP',
                                                        });
                                                    }}
                                                    className="border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 cursor-pointer rounded-xl py-2.5 px-2 font-serif text-xs font-bold shadow-xs transition-colors"
                                                >
                                                    Revertir a Pendiente
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setConfirmError(null);
                                                        setConfirmState({
                                                            orderId: order.id,
                                                            customerName: order.customer_name,
                                                            fromStatus: 'CONFIRMED',
                                                            status: 'CANCELLED',
                                                        });
                                                    }}
                                                    className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer rounded-xl py-2.5 px-2 font-serif text-xs font-bold shadow-xs transition-colors"
                                                >
                                                    Cancelar y reponer stock
                                                </button>
                                            </div>
                                        )}

                                        {order.status === 'CANCELLED' && (
                                            <div className="pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setConfirmError(null);
                                                        setConfirmState({
                                                            orderId: order.id,
                                                            customerName: order.customer_name,
                                                            fromStatus: 'CANCELLED',
                                                            status: 'PENDING_WHATSAPP',
                                                        });
                                                    }}
                                                    className="w-full border border-forest/30 bg-forest/10 text-forest hover:bg-forest/20 cursor-pointer rounded-xl py-2.5 font-serif text-xs font-bold shadow-xs transition-colors"
                                                >
                                                    Reactivar pedido (a Pendiente)
                                                </button>
                                            </div>
                                        )}

                                        {order.status === 'PENDING_WHATSAPP' && (
                                            <div className="grid grid-cols-2 gap-3 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setConfirmError(null);
                                                        setConfirmState({
                                                            orderId: order.id,
                                                            customerName: order.customer_name,
                                                            fromStatus: 'PENDING_WHATSAPP',
                                                            status: 'CANCELLED',
                                                        });
                                                    }}
                                                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer rounded-xl py-2.5 font-serif text-xs font-bold shadow-xs transition-colors"
                                                >
                                                    Rechazar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setConfirmError(null);
                                                        setConfirmState({
                                                            orderId: order.id,
                                                            customerName: order.customer_name,
                                                            fromStatus: 'PENDING_WHATSAPP',
                                                            status: 'CONFIRMED',
                                                        });
                                                    }}
                                                    className="bg-forest hover:bg-forest-light text-white cursor-pointer rounded-xl py-2.5 font-serif text-xs font-bold shadow-xs transition-colors"
                                                >
                                                    Aceptar y Confirmar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                <PaginationLinks
                    links={orders.links}
                    className="flex flex-wrap items-center justify-center gap-1.5 pt-4"
                />
            </div>

            {/* Status Update Confirmation Modal */}
            {confirmState && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-paper border-paper-dark w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-2xl">
                        <h3 className="text-ink font-serif text-lg font-bold">
                            {confirmState.status === 'CONFIRMED'
                                ? '¿Confirmar pedido?'
                                : confirmState.status === 'PENDING_WHATSAPP'
                                  ? confirmState.fromStatus === 'CONFIRMED'
                                      ? '¿Revertir confirmación?'
                                      : '¿Reactivar pedido?'
                                  : '¿Cancelar pedido?'}
                        </h3>
                        <p className="text-ink-muted text-xs leading-relaxed">
                            {confirmState.status === 'CONFIRMED'
                                ? `Se marcará el pedido de ${confirmState.customerName} como confirmado y se descontará automáticamente el stock de los productos vendidos en el inventario.`
                                : confirmState.status === 'PENDING_WHATSAPP'
                                  ? confirmState.fromStatus === 'CONFIRMED'
                                      ? `El pedido de ${confirmState.customerName} volverá a Pendiente y se repondrá el stock previamente descontado.`
                                      : `El pedido de ${confirmState.customerName} volverá a Pendiente para coordinar nuevamente por WhatsApp (sin descontar stock aún).`
                                  : confirmState.fromStatus === 'CONFIRMED'
                                    ? `El pedido de ${confirmState.customerName} se cancelará y se repondrá el stock previamente descontado en el inventario.`
                                    : `El pedido de ${confirmState.customerName} pasará a la sección de Cancelados sin descontar stock del inventario.`}
                        </p>
                        {confirmError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                                {confirmError}
                            </div>
                        )}
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setConfirmState(null);
                                    setConfirmError(null);
                                }}
                                disabled={isProcessing}
                                className="border-stone-300 text-ink hover:bg-paper-dark rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmStatus}
                                disabled={isProcessing}
                                className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer ${
                                    confirmState.status === 'CONFIRMED'
                                        ? 'bg-forest hover:bg-forest-light'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {isProcessing ? 'Procesando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default Index;
