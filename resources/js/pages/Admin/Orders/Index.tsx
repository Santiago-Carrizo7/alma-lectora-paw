import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BookThumbnail } from '../../../components/ui/book-thumbnail';
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
    status: 'CONFIRMED' | 'CANCELLED';
}

interface DeleteState {
    orderId: string;
    customerName: string;
}

export function Index({ orders, filters, counts }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [confirmState, setConfirmState] = useState<ConfirmStatusState | null>(null);
    const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
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
        setIsProcessing(true);
        router.patch(
            `/admin/pedidos/${confirmState.orderId}/estado`,
            { status: confirmState.status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmState(null);
                    setIsProcessing(false);
                },
                onError: () => setIsProcessing(false),
            },
        );
    };

    const handleDeleteOrder = () => {
        if (!deleteState) return;
        setIsProcessing(true);
        router.delete(`/admin/pedidos/${deleteState.orderId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteState(null);
                setIsProcessing(false);
            },
            onError: () => setIsProcessing(false),
        });
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

                {/* Tabs */}
                <div className="border-paper-dark flex border-b pb-1 gap-2 overflow-x-auto">
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
                                            <button
                                                type="button"
                                                title="Eliminar pedido"
                                                onClick={() =>
                                                    setDeleteState({
                                                        orderId: order.id,
                                                        customerName: order.customer_name,
                                                    })
                                                }
                                                className="hover:bg-red-50 text-stone-400 hover:text-red-600 cursor-pointer rounded p-1 transition-colors"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                </svg>
                                            </button>
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
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.62.962 3.21 1.454 4.887 1.455 5.483 0 9.943-4.453 9.946-9.93.002-2.653-1.03-5.148-2.906-7.027-1.875-1.878-4.37-2.914-7.022-2.915-5.485 0-9.946 4.454-9.95 9.932-.001 1.839.492 3.633 1.427 5.22l-.993 3.626 3.71-.973zm13.125-9.664c-.3-.15-1.776-.875-2.05-.975-.274-.1-.475-.15-.676.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.795-1.49-1.77-1.665-2.07-.175-.3-.02-.46.13-.61.135-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.625-.926-2.225-.244-.589-.49-.51-.676-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.224 5.112 4.525.715.31 1.273.495 1.71.635.717.227 1.37.195 1.885.118.574-.085 1.776-.725 2.025-1.425.25-.7.25-1.3 0-1.425-.075-.125-.275-.2-.575-.35z" />
                                                </svg>
                                                <span>Chatear (+{order.customer_phone})</span>
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
                                                const itemSubtotal = parseFloat(String(unitPrice)) * item.quantity;
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

                                        {order.status === 'PENDING_WHATSAPP' && (
                                            <div className="grid grid-cols-2 gap-3 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setConfirmState({
                                                            orderId: order.id,
                                                            customerName: order.customer_name,
                                                            status: 'CANCELLED',
                                                        })
                                                    }
                                                    className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer rounded-xl py-2.5 font-serif text-xs font-bold shadow-xs transition-colors"
                                                >
                                                    Rechazar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setConfirmState({
                                                            orderId: order.id,
                                                            customerName: order.customer_name,
                                                            status: 'CONFIRMED',
                                                        })
                                                    }
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
                {orders.links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4">
                        {orders.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    link.active
                                        ? 'bg-forest text-white font-bold'
                                        : link.url
                                        ? 'bg-paper border-paper-dark hover:bg-paper-dark text-ink border'
                                        : 'text-stone-400 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Status Update Confirmation Modal */}
            {confirmState && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-paper border-paper-dark w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-2xl">
                        <h3 className="text-ink font-serif text-lg font-bold">
                            {confirmState.status === 'CONFIRMED'
                                ? '¿Confirmar pedido?'
                                : '¿Cancelar pedido?'}
                        </h3>
                        <p className="text-ink-muted text-xs leading-relaxed">
                            {confirmState.status === 'CONFIRMED'
                                ? `Se marcará el pedido de ${confirmState.customerName} como confirmado.`
                                : `Se cancelará el pedido de ${confirmState.customerName}.`}
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmState(null)}
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

            {/* Delete Confirmation Modal */}
            {deleteState && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-paper border-paper-dark w-full max-w-sm space-y-4 rounded-2xl border p-6 shadow-2xl">
                        <h3 className="text-ink font-serif text-lg font-bold">
                            ¿Eliminar registro de pedido?
                        </h3>
                        <p className="text-ink-muted text-xs leading-relaxed">
                            Esta acción eliminará permanentemente la orden de {deleteState.customerName} del sistema.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteState(null)}
                                disabled={isProcessing}
                                className="border-stone-300 text-ink hover:bg-paper-dark rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
                            >
                                Volver
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteOrder}
                                disabled={isProcessing}
                                className="bg-red-600 hover:bg-red-700 rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
                            >
                                {isProcessing ? 'Eliminando...' : 'Eliminar Pedido'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default Index;
