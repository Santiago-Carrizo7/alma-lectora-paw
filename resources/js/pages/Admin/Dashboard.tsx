import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { AdminLayout } from '../../layouts/admin-layout';
import { formatPrice } from '../../lib/price';
import { useAuth } from '../../hooks/use-auth';

interface MetricData {
    pending_orders: number;
    month_revenue: number;
    out_of_stock_books: number;
    month_confirmed_orders: number;
    period_total_orders?: number;
    total_orders: number;
    total_confirmed_revenue: number;
}

interface RecentOrder {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    total_amount: number | string;
    status: string;
    created_at: string;
}

interface DashboardProps {
    metrics?: MetricData;
    recentOrders?: RecentOrder[];
}

export function Dashboard({
    metrics = {
        pending_orders: 0,
        month_revenue: 0,
        out_of_stock_books: 0,
        month_confirmed_orders: 0,
        total_orders: 0,
        total_confirmed_revenue: 0,
    },
    recentOrders = [],
}: DashboardProps) {
    const { can, isSuperAdmin } = useAuth();

    const baseModules = [
        {
            title: 'Gestión de Libros',
            description: 'Control de inventario, ABM y alta de libros mediante buscador ISBN o manual.',
            href: '/admin/libros',
            permission: 'listar libros',
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
            permission: 'listar accesorios',
            icon: (
                <svg className="text-forest h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
                    />
                </svg>
            ),
        },
        {
            title: 'Combos Exclusivos',
            description: 'Creación y personalización de paquetes promocionales temáticos.',
            href: '/admin/combos',
            permission: 'listar combos',
            icon: (
                <svg className="text-forest h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                    />
                </svg>
            ),
        },
        {
            title: 'Gestión de Pedidos',
            description: 'Seguimiento de compras WhatsApp, confirmación y emisión de remitos oficiales.',
            href: '/admin/pedidos',
            permission: 'listar pedidos',
            icon: (
                <svg className="text-forest h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                </svg>
            ),
        },
        {
            title: 'Configuración Tienda',
            description: 'Parámetros del negocio, datos de contacto, géneros y categorías.',
            href: '/admin/configuracion',
            permission: 'gestionar configuracion tienda',
            icon: (
                <svg className="text-forest h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            ),
        },
        {
            title: 'Reportes',
            description: 'Resumen de ventas con filtros por período, ranking de compradores y exportación a PDF o Excel.',
            href: '/admin/reportes',
            permission: 'ver reportes estadisticos',
            icon: (
                <svg className="text-forest h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
            ),
        },
    ];

    const securityModules = [
        {
            title: 'Gestión de Usuarios',
            description: 'Administración de cuentas, credenciales y asignación de roles a usuarios.',
            href: '/admin/usuarios',
            permission: 'listar usuarios',
            icon: (
                <svg className="text-purple-700 h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
            ),
        },
        {
            title: 'Roles y Permisos',
            description: 'Definición de roles del sistema, asignación de permisos y control RBAC.',
            href: '/admin/roles',
            permission: 'listar roles',
            icon: (
                <svg className="text-purple-700 h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
            ),
        },
    ];

    const allModules = [...baseModules, ...(isSuperAdmin ? securityModules : [])];
    const modules = allModules.filter((m) => !m.permission || can(m.permission));

    return (
        <AdminLayout
            title="Panel de Control General"
            subtitle="Módulos de gestión y administración centralizada"
            breadcrumbText="Volver al Catálogo"
            breadcrumbHref="/libros"
        >
            <Head title="Panel de Administración" />

            <div className="space-y-8 animate-fade-in">
                {/* 1. Modules Grid (2 por fila) */}
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

                {/* 2. Tablero Operativo del Día a Día */}
                {can('ver dashboard') && (
                <div className="border-paper-dark border-t pt-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h3 className="text-ink font-serif text-xl font-bold">
                                Tablero Operativo de la Tienda
                            </h3>
                            <p className="text-ink-muted text-xs mt-0.5">
                                Métricas de acción inmediata e inventario crítico
                            </p>
                        </div>
                        {can('ver reportes estadisticos') && (
                            <Link
                                href="/admin/reportes"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-dark hover:underline"
                            >
                                <span>Ir al centro analítico completo</span>
                                <span>&rarr;</span>
                            </Link>
                        )}
                    </div>

                    {/* KPI Cards Strip (4 métricas de acción real) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* KPI 1: Pedidos Pendientes de WhatsApp */}
                        <Link
                            href="/admin/pedidos"
                            className="bg-paper border-paper-dark/70 hover:border-amber/50 rounded-2xl border p-5 shadow-2xs space-y-2 transition-all hover:shadow-xs block"
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-ink-muted text-xs font-bold uppercase tracking-wider">
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
                                {metrics.pending_orders > 0 ? 'Requieren respuesta y confirmación' : 'Todos los pedidos al día'}
                            </p>
                        </Link>

                        {/* KPI 2: Facturación del Último Mes (30 días) */}
                        <div className="bg-paper border-paper-dark/70 rounded-2xl border p-5 shadow-2xs space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="text-ink-muted text-xs font-bold uppercase tracking-wider">
                                    Ventas (Últimos 30 días)
                                </span>
                                <div className="bg-forest/10 text-forest p-2 rounded-lg">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-forest font-serif text-2xl font-bold truncate">
                                {formatPrice(metrics.month_revenue)}
                            </div>
                            <p className="text-ink-muted text-[11px]">
                                {metrics.month_confirmed_orders} pedidos confirmados en los últimos 30 días
                            </p>
                        </div>

                        {/* KPI 3: Libros Sin Stock (Stock = 0 estricto) */}
                        <Link
                            href="/admin/libros?stock_status=out_of_stock"
                            className="bg-paper border-paper-dark/70 hover:border-red-400 rounded-2xl border p-5 shadow-2xs space-y-2 transition-all hover:shadow-xs block"
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-ink-muted text-xs font-bold uppercase tracking-wider">
                                    Libros Agotados (Stock 0)
                                </span>
                                <div className={`p-2 rounded-lg ${metrics.out_of_stock_books > 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                    </svg>
                                </div>
                            </div>
                            <div className={`font-serif text-3xl font-bold ${metrics.out_of_stock_books > 0 ? 'text-red-700' : 'text-forest'}`}>
                                {metrics.out_of_stock_books}
                            </div>
                            <p className="text-ink-muted text-[11px]">
                                {metrics.out_of_stock_books > 0 ? 'Títulos requieren reposición urgente' : 'Sin ejemplares agotados'}
                            </p>
                        </Link>

                        {/* KPI 4: Pedidos Concretados del Mes */}
                        <div className="bg-paper border-paper-dark/70 rounded-2xl border p-5 shadow-2xs space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="text-ink-muted text-xs font-bold uppercase tracking-wider">
                                    Pedidos Confirmados
                                </span>
                                <div className="bg-stone-100 text-stone-700 p-2 rounded-lg">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-ink font-serif text-3xl font-bold">
                                {metrics.month_confirmed_orders}
                            </div>
                            <p className="text-ink-muted text-[11px]">
                                de {metrics.period_total_orders ?? metrics.total_orders} pedidos recibidos en los últimos 30 días
                            </p>
                        </div>
                    </div>

                    {/* Foco Central Operativo: Últimos Pedidos Recibidos */}
                    <div className="bg-paper border-paper-dark/70 rounded-2xl border p-6 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-ink font-serif text-base font-bold">
                                    Últimos Pedidos Recibidos
                                </h4>
                                <p className="text-ink-muted text-xs">
                                    Solicitudes más recientes para despacho y consulta inmediata de remitos
                                </p>
                            </div>
                            <Link
                                href="/admin/pedidos"
                                className="text-forest hover:text-forest-dark text-xs font-bold underline"
                            >
                                Gestionar todos los pedidos &rarr;
                            </Link>
                        </div>

                        {recentOrders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-paper-dark text-ink-muted text-[10px] uppercase tracking-wider">
                                            <th className="py-2.5 pr-4 font-semibold">Orden</th>
                                            <th className="py-2.5 px-4 font-semibold">Cliente</th>
                                            <th className="py-2.5 px-4 font-semibold">Contacto</th>
                                            <th className="py-2.5 px-4 font-semibold">Total</th>
                                            <th className="py-2.5 px-4 font-semibold text-center">Estado</th>
                                            <th className="py-2.5 px-4 font-semibold text-right">Fecha</th>
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
                                                    {order.customer_phone ? `+${order.customer_phone}` : '-'}
                                                </td>
                                                <td className="py-3 px-4 font-bold text-forest">
                                                    {formatPrice(order.total_amount)}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span
                                                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                            order.status === 'PENDING_WHATSAPP'
                                                                ? 'bg-amber/10 text-amber border-amber/30'
                                                                : order.status === 'CONFIRMED'
                                                                ? 'bg-forest/10 text-forest border-forest/30'
                                                                : 'bg-red-50 text-red-700 border-red-200'
                                                        }`}
                                                    >
                                                        {order.status === 'PENDING_WHATSAPP'
                                                            ? 'Pendiente'
                                                            : order.status === 'CONFIRMED'
                                                            ? 'Confirmado'
                                                            : 'Cancelado'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right text-stone-500 text-[11px]">
                                                    {new Date(order.created_at).toLocaleDateString('es-AR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                <td className="py-3 pl-4 text-right">
                                                    <a
                                                        href={`/admin/pedidos/${order.id}/remito`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="border-paper-dark hover:bg-paper-dark/60 text-ink-muted hover:text-forest bg-paper inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors shadow-2xs"
                                                        title="Abrir remito PDF"
                                                    >
                                                        <svg className="text-forest h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                        </svg>
                                                        <span>Remito</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-xs text-ink-muted">
                                Aún no hay pedidos registrados en el sistema.
                            </div>
                        )}
                    </div>
                </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default Dashboard;
