import { Head, Link } from '@inertiajs/react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { AdminLayout } from '../../layouts/admin-layout';
import { formatPrice } from '../../lib/price';

interface MetricData {
    total_books: number;
    active_books: number;
    low_stock_books: number;
    total_accessories: number;
    total_combos: number;
    total_orders: number;
    pending_orders: number;
    confirmed_orders: number;
    confirmed_revenue: number;
}

interface GenreData {
    name: string;
    cantidad: number;
}

interface OrderStatusData {
    status: string;
    label: string;
    cantidad: number;
}

interface RecentOrder {
    id: string;
    customer_name: string;
    customer_phone: string;
    total_amount: number | string;
    status: string;
    created_at: string;
}

interface DashboardProps {
    metrics?: MetricData;
    booksByGenre?: GenreData[];
    ordersByStatus?: OrderStatusData[];
    recentOrders?: RecentOrder[];
}

export function Dashboard({
    metrics = {
        total_books: 0,
        active_books: 0,
        low_stock_books: 0,
        total_accessories: 0,
        total_combos: 0,
        total_orders: 0,
        pending_orders: 0,
        confirmed_orders: 0,
        confirmed_revenue: 0,
    },
    booksByGenre = [],
    ordersByStatus = [],
    recentOrders = [],
}: DashboardProps) {
    const modules = [
        {
            title: 'Gestión de Libros',
            description: 'Control de inventario, ABM y alta de libros mediante buscador ISBN o manual.',
            href: '/admin/libros',
            icon: (
                <svg className="text-forest h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                    />
                </svg>
            ),
        },
        {
            title: 'Accesorios',
            description: 'Mantenimiento de catálogo de velas aromáticas, señaladores y complementos.',
            href: '/admin/accesorios',
            icon: (
                <svg className="text-forest h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z"
                    />
                </svg>
            ),
        },
        {
            title: 'Combos Promocionales',
            description: 'Creación y edición de paquetes de libros con accesorios y descuentos.',
            href: '/admin/combos',
            icon: (
                <svg className="text-forest h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0-2.625V7.5m0 0h-3.75M12 7.5h3.75M3.75 7.5h16.5a1.5 1.5 0 0 1 1.5 1.5v1.5a1.5 1.5 0 0 1-1.5 1.5H3.75A1.5 1.5 0 0 1 2.25 10.5V9a1.5 1.5 0 0 1 1.5-1.5Z"
                    />
                </svg>
            ),
        },
        {
            title: 'Gestión de Pedidos',
            description: 'Control de confirmaciones de compras, chat directo con clientes y descuento de stock.',
            href: '/admin/pedidos',
            icon: (
                <svg className="text-forest h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.75A1.125 1.125 0 0 1 2.625 17.625V4.625A1.125 1.125 0 0 1 3.75 3.5h1.625c.621 0 1.125.504 1.125 1.125v9.75c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.75M16.5 9.75V3.5m0 0h1.625a1.125 1.125 0 0 1 1.125 1.125v4.375c0 .621-.504 1.125-1.125 1.125H16.5M16.5 3.5v6.25"
                    />
                </svg>
            ),
        },
        {
            title: 'Configuración',
            description: 'Ajustes generales de la tienda, costos de envío y variables del sistema.',
            href: '/admin/configuracion',
            icon: (
                <svg className="text-forest h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            ),
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return '#2d5016'; // Forest
            case 'PENDING_WHATSAPP':
                return '#b45309'; // Amber
            default:
                return '#991b1b'; // Red
        }
    };

    return (
        <AdminLayout
            title="Panel de Control General"
            subtitle="Módulos de gestión y administración centralizada"
            breadcrumbText="Volver al Catálogo"
            breadcrumbHref="/libros"
        >
            <Head title="Panel de Administración" />

            <div className="space-y-8 animate-fade-in">
                {/* 1. Modules Grid (2 por fila, buen tamaño) */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {modules.map((mod) => (
                        <Link
                            key={mod.title}
                            href={mod.href}
                            className="bg-paper-dark/40 border-paper-dark/60 hover:border-forest/30 group flex cursor-pointer items-start gap-4 rounded-xl border p-6 shadow-xs transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
                        >
                            <div className="bg-paper border-paper-dark group-hover:bg-forest/5 shrink-0 rounded-lg border p-3 transition-colors">
                                {mod.icon}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-ink group-hover:text-forest font-serif text-lg font-bold transition-colors">
                                    {mod.title}
                                </h3>
                                <p className="text-ink-muted text-xs leading-relaxed">
                                    {mod.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 3. Sección Dashboard Analítico abajo de los módulos */}
                <div className="border-paper-dark border-t pt-6 space-y-6">
                    <div>
                        <h3 className="text-ink font-serif text-xl font-bold">
                            Resumen y Estadísticas de la Tienda
                        </h3>
                        <p className="text-ink-muted text-xs mt-0.5">
                            Estado general del catálogo, inventario y pedidos registrados
                        </p>
                    </div>

                    {/* KPI Cards Strip (4 Metrics) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* KPI 1: Libros Activos */}
                        <div className="bg-paper border-paper-dark/70 rounded-2xl border p-5 shadow-2xs space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="text-ink-muted text-xs font-medium uppercase tracking-wider">
                                    Catálogo de Libros
                                </span>
                                <div className="bg-forest/10 text-forest p-2 rounded-lg">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-ink font-serif text-3xl font-bold">
                                {metrics.active_books}
                            </div>
                            <p className="text-ink-muted text-[11px]">
                                {metrics.total_books} registrados &bull; {metrics.total_accessories} accesorios &bull; {metrics.total_combos} combos
                            </p>
                        </div>

                        {/* KPI 2: Pedidos Pendientes */}
                        <div className="bg-paper border-paper-dark/70 rounded-2xl border p-5 shadow-2xs space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="text-ink-muted text-xs font-medium uppercase tracking-wider">
                                    Pendientes WhatsApp
                                </span>
                                <div className={`p-2 rounded-lg ${metrics.pending_orders > 0 ? 'bg-amber/15 text-amber' : 'bg-stone-100 text-stone-500'}`}>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>
                            </div>
                            <div className={`font-serif text-3xl font-bold ${metrics.pending_orders > 0 ? 'text-amber' : 'text-ink'}`}>
                                {metrics.pending_orders}
                            </div>
                            <p className="text-ink-muted text-[11px]">
                                de {metrics.total_orders} pedidos totales recibidos
                            </p>
                        </div>

                        {/* KPI 3: Ventas Confirmadas */}
                        <div className="bg-paper border-paper-dark/70 rounded-2xl border p-5 shadow-2xs space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="text-ink-muted text-xs font-medium uppercase tracking-wider">
                                    Facturación Confirmada
                                </span>
                                <div className="bg-forest/10 text-forest p-2 rounded-lg">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-forest font-serif text-2xl font-bold truncate">
                                {formatPrice(metrics.confirmed_revenue)}
                            </div>
                            <p className="text-ink-muted text-[11px]">
                                {metrics.confirmed_orders} pedidos concretados
                            </p>
                        </div>

                        {/* KPI 4: Stock Crítico */}
                        <div className="bg-paper border-paper-dark/70 rounded-2xl border p-5 shadow-2xs space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="text-ink-muted text-xs font-medium uppercase tracking-wider">
                                    Stock Crítico (≤ 3)
                                </span>
                                <div className={`p-2 rounded-lg ${metrics.low_stock_books > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                    </svg>
                                </div>
                            </div>
                            <div className={`font-serif text-3xl font-bold ${metrics.low_stock_books > 0 ? 'text-red-700' : 'text-forest'}`}>
                                {metrics.low_stock_books}
                            </div>
                            <p className="text-ink-muted text-[11px]">
                                {metrics.low_stock_books > 0 ? 'Ejemplares requieren reposición' : 'Niveles de inventario óptimos'}
                            </p>
                        </div>
                    </div>

                    {/* Recharts Analytics Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Gráfico 1: Títulos por Género */}
                        <div className="bg-paper border-paper-dark/70 rounded-2xl border p-6 shadow-2xs space-y-4">
                            <div>
                                <h4 className="text-ink font-serif text-base font-bold">
                                    Libros por Género Literario
                                </h4>
                                <p className="text-ink-muted text-xs">
                                    Distribución de los títulos más frecuentes en el catálogo
                                </p>
                            </div>

                            <div className="h-64 w-full pt-2">
                                {booksByGenre.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={booksByGenre} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ede7d9" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#78716c"
                                                fontSize={11}
                                                tickLine={false}
                                                interval={0}
                                                angle={-20}
                                                textAnchor="end"
                                            />
                                            <YAxis stroke="#78716c" fontSize={11} tickLine={false} allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    borderColor: '#e7dfd1',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                                }}
                                                formatter={(value) => [`${value} libros`, 'Cantidad']}
                                            />
                                            <Bar dataKey="cantidad" fill="#2d5016" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-ink-muted text-xs">
                                        Sin datos de géneros registrados
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gráfico 2: Pedidos por Estado */}
                        <div className="bg-paper border-paper-dark/70 rounded-2xl border p-6 shadow-2xs space-y-4">
                            <div>
                                <h4 className="text-ink font-serif text-base font-bold">
                                    Estado de Pedidos
                                </h4>
                                <p className="text-ink-muted text-xs">
                                    Solicitudes según su estado actual
                                </p>
                            </div>

                            <div className="h-64 w-full pt-2">
                                {ordersByStatus.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={ordersByStatus} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ede7d9" vertical={false} />
                                            <XAxis dataKey="label" stroke="#78716c" fontSize={11} tickLine={false} />
                                            <YAxis stroke="#78716c" fontSize={11} tickLine={false} allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#ffffff',
                                                    borderColor: '#e7dfd1',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                }}
                                                formatter={(value) => [`${value} pedidos`, 'Total']}
                                            />
                                            <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                                                {ordersByStatus.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-ink-muted text-xs">
                                        Aún no hay pedidos registrados
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Orders Quick Table */}
                    {recentOrders.length > 0 && (
                        <div className="bg-paper border-paper-dark/70 rounded-2xl border p-6 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-ink font-serif text-base font-bold">
                                        Últimos Pedidos Recibidos
                                    </h4>
                                    <p className="text-ink-muted text-xs">
                                        Solicitudes más recientes con acceso al remito de despacho
                                    </p>
                                </div>
                                <Link
                                    href="/admin/pedidos"
                                    className="text-forest hover:text-forest-light text-xs font-bold underline"
                                >
                                    Ver todos los pedidos &rarr;
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-paper-dark text-ink-muted text-[10px] uppercase tracking-wider">
                                            <th className="py-2.5 pr-4 font-semibold">Orden</th>
                                            <th className="py-2.5 px-4 font-semibold">Cliente</th>
                                            <th className="py-2.5 px-4 font-semibold">Teléfono</th>
                                            <th className="py-2.5 px-4 font-semibold">Total</th>
                                            <th className="py-2.5 px-4 font-semibold">Estado</th>
                                            <th className="py-2.5 pl-4 text-right font-semibold">Remito</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-paper-dark/60">
                                        {recentOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-paper-dark/20 transition-colors">
                                                <td className="py-3 pr-4 font-mono font-medium text-ink">
                                                    #{order.id.substring(0, 8)}
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-ink">
                                                    {order.customer_name}
                                                </td>
                                                <td className="py-3 px-4 text-ink-muted font-mono">
                                                    +{order.customer_phone}
                                                </td>
                                                <td className="py-3 px-4 font-bold text-amber">
                                                    {formatPrice(order.total_amount)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                            order.status === 'PENDING_WHATSAPP'
                                                                ? 'bg-amber/10 text-amber border-amber/20'
                                                                : order.status === 'CONFIRMED'
                                                                ? 'bg-forest/10 text-forest border-forest/20'
                                                                : 'bg-red-50 text-red-700 border-red-100'
                                                        }`}
                                                    >
                                                        {order.status === 'PENDING_WHATSAPP'
                                                            ? 'Pendiente'
                                                            : order.status === 'CONFIRMED'
                                                            ? 'Confirmado'
                                                            : 'Cancelado'}
                                                    </span>
                                                </td>
                                                <td className="py-3 pl-4 text-right">
                                                    <a
                                                        href={`/admin/pedidos/${order.id}/remito`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="border-paper-dark hover:bg-paper-dark/60 text-ink-muted hover:text-forest bg-paper inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold transition-colors shadow-2xs"
                                                    >
                                                        <svg className="text-forest h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                        </svg>
                                                        PDF
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default Dashboard;
