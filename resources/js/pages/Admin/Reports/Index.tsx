import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import AdminLayout from '@/layouts/admin-layout';
import { formatPrice } from '@/lib/price';

interface KpiData {
    total_orders: number;
    confirmed_orders: number;
    pending_orders: number;
    cancelled_orders: number;
    total_revenue: number;
    average_ticket: number;
    conversion_rate: number;
    units_sold: number;
    accessory_units_sold?: number;
    combo_units_sold?: number;
    total_item_units_sold?: number;
    catalog_size: number;
    critical_stock_count: number;
}

interface TimelinePoint {
    date: string;
    label: string;
    ventas: number;
    pedidos: number;
}

interface StatusDistributionItem {
    status: string;
    label: string;
    cantidad: number;
    porcentaje: number;
    color: string;
}

interface CustomerData {
    name: string;
    email: string;
    dni: string;
    phone: string;
    is_registered: boolean;
    orders_count: number;
    total_spent: number;
    last_order_at: string;
}

interface BookSalesData {
    id: string;
    isbn: string;
    title: string;
    authors: string;
    genre: string;
    price: number;
    stock: number;
    units_sold: number;
    total_revenue: number;
}

interface CriticalStockData {
    id: string;
    isbn: string;
    title: string;
    authors: string;
    stock: number;
    price: number;
    status: string;
}

interface ReportProps {
    report: {
        period?: string;
        period_label?: string;
        kpis: KpiData;
        timeline?: TimelinePoint[];
        status_distribution?: StatusDistributionItem[];
        top_customers: CustomerData[];
        best_selling_books: BookSalesData[];
        least_selling_books: BookSalesData[];
        no_sales_books: BookSalesData[];
        critical_stock: CriticalStockData[];
        generated_at: string;
        generated_by: string;
    };
    currentPeriod?: string;
    customRange?: {
        from: string;
        to: string;
    };
}

export default function ReportsIndex({
    report,
    currentPeriod = '30_days',
    customRange = { from: '', to: '' },
}: ReportProps) {
    const [activeTab, setActiveTab] = useState<
        'customers' | 'best_selling' | 'least_selling' | 'no_sales' | 'critical'
    >('customers');
    const [showCustomPicker, setShowCustomPicker] = useState(currentPeriod === 'custom');
    const [customFrom, setCustomFrom] = useState(customRange.from || '');
    const [customTo, setCustomTo] = useState(customRange.to || '');
    const [customError, setCustomError] = useState('');

    const {
        period_label = 'Últimos 30 días',
        kpis,
        timeline = [],
        status_distribution = [],
        top_customers = [],
        best_selling_books = [],
        least_selling_books = [],
        no_sales_books = [],
        critical_stock = [],
    } = report;

    const periods = [
        { key: '7_days', label: 'Últimos 7 días' },
        { key: '30_days', label: 'Últimos 30 días' },
        { key: 'current_month', label: 'Mes actual' },
        { key: 'all', label: 'Histórico completo' },
    ];

    const handlePeriodChange = (selectedPeriod: string) => {
        setShowCustomPicker(false);
        setCustomError('');
        router.get(
            '/admin/reportes',
            { period: selectedPeriod },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleApplyCustomRange = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customFrom || !customTo) {
            setCustomError('Indicá ambas fechas (Desde y Hasta) para filtrar.');
            return;
        }
        if (customTo < customFrom) {
            setCustomError('La fecha "Hasta" debe ser igual o posterior a "Desde".');
            return;
        }
        setCustomError('');
        router.get(
            '/admin/reportes',
            { period: 'custom', from: customFrom, to: customTo },
            { preserveState: true, preserveScroll: true }
        );
    };

    const downloadQuery =
        currentPeriod === 'custom' && customRange.from && customRange.to
            ? `period=custom&from=${encodeURIComponent(customRange.from)}&to=${encodeURIComponent(customRange.to)}`
            : `period=${encodeURIComponent(currentPeriod)}`;

    const actionButtons = (
        <div className="flex flex-wrap items-center gap-2">
            <a
                href={`/admin/reportes/pdf?${downloadQuery}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 shadow-xs transition hover:bg-red-100"
                title={`Descargar reporte en PDF (${period_label})`}
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5h6m-6 3h4" />
                </svg>
                <span>Descargar PDF</span>
            </a>

            <a
                href={`/admin/reportes/excel?${downloadQuery}`}
                className="inline-flex items-center gap-2 rounded-xl bg-forest px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-forest-dark"
                title={`Descargar reporte en Excel (${period_label})`}
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                </svg>
                <span>Exportar Excel</span>
            </a>
        </div>
    );

    return (
        <AdminLayout
            title="Reportes"
            subtitle={`Resumen de ventas e inventario • ${period_label}`}
            breadcrumbText="Volver al Panel Central"
            breadcrumbHref="/admin"
            action={actionButtons}
        >
            <Head title={`Reportes (${period_label}) - Alma Lectora`} />

            <div className="space-y-6 animate-fade-in">
                {/* 1. Selector de Período y Filtro Temporal */}
                <div className="bg-paper border border-paper-dark/70 rounded-2xl p-4 shadow-2xs space-y-3">
                    <span className="text-ink font-serif text-sm font-bold block">
                        Filtrar analítica por período
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-paper-dark/30 p-1.5 rounded-xl border border-stone-200 w-full">
                        {periods.map((p) => {
                            const isActive = currentPeriod === p.key && !showCustomPicker;
                            return (
                                <button
                                    key={p.key}
                                    type="button"
                                    onClick={() => handlePeriodChange(p.key)}
                                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                                        isActive
                                            ? 'bg-forest text-white shadow-xs font-bold'
                                            : 'text-stone-600 hover:text-ink hover:bg-stone-200/60'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => setShowCustomPicker((prev) => !prev)}
                            className={`col-span-2 sm:col-span-1 w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center ${
                                currentPeriod === 'custom' || showCustomPicker
                                    ? 'bg-forest text-white shadow-xs font-bold'
                                    : 'text-stone-600 hover:text-ink hover:bg-stone-200/60'
                            }`}
                        >
                            Rango personalizado
                        </button>
                    </div>

                    {(showCustomPicker || currentPeriod === 'custom') && (
                        <form
                            onSubmit={handleApplyCustomRange}
                            className="flex flex-col sm:flex-row sm:items-end gap-3 pt-2 border-t border-paper-dark/40"
                        >
                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                                    Desde
                                </label>
                                <input
                                    type="date"
                                    value={customFrom}
                                    onChange={(e) => setCustomFrom(e.target.value)}
                                    className="w-full sm:w-auto rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-ink focus:border-forest focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1">
                                    Hasta
                                </label>
                                <input
                                    type="date"
                                    value={customTo}
                                    onChange={(e) => setCustomTo(e.target.value)}
                                    className="w-full sm:w-auto rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-ink focus:border-forest focus:outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="rounded-lg bg-forest px-4 py-2 text-xs font-semibold text-white hover:bg-forest-dark transition cursor-pointer shrink-0"
                            >
                                Aplicar rango
                            </button>
                            {customError && (
                                <p className="text-xs font-medium text-red-600">{customError}</p>
                            )}
                        </form>
                    )}
                </div>

                {/* 2. Resumen de KPIs Comerciales del Período */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                    {/* Ventas Confirmadas */}
                    <div className="bg-paper border border-paper-dark/70 rounded-xl p-4 shadow-2xs">
                        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                            Ventas Confirmadas
                        </span>
                        <div className="text-forest font-serif text-xl sm:text-2xl font-bold truncate mt-1">
                            {formatPrice(kpis.total_revenue)}
                        </div>
                        <p className="text-[10px] text-ink-muted mt-1">
                            {kpis.confirmed_orders} pedidos confirmados
                        </p>
                    </div>

                    {/* Ticket Promedio */}
                    <div className="bg-paper border border-paper-dark/70 rounded-xl p-4 shadow-2xs">
                        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                            Ticket Promedio
                        </span>
                        <div className="text-ink font-serif text-xl sm:text-2xl font-bold truncate mt-1">
                            {formatPrice(kpis.average_ticket)}
                        </div>
                        <p className="text-[10px] text-ink-muted mt-1">
                            por pedido confirmado
                        </p>
                    </div>

                    {/* Tasa de Confirmación */}
                    <div className="bg-paper border border-paper-dark/70 rounded-xl p-4 shadow-2xs">
                        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                            Tasa de Confirmación
                        </span>
                        <div className="text-amber-700 font-serif text-xl sm:text-2xl font-bold mt-1">
                            {kpis.conversion_rate}%
                        </div>
                        <p className="text-[10px] text-ink-muted mt-1">
                            de {kpis.total_orders} pedidos recibidos
                        </p>
                    </div>

                    {/* Libros Vendidos */}
                    <div className="bg-paper border border-paper-dark/70 rounded-xl p-4 shadow-2xs">
                        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                            Libros Vendidos
                        </span>
                        <div className="text-ink font-serif text-xl sm:text-2xl font-bold mt-1">
                            {kpis.units_sold}
                        </div>
                        <p className="text-[10px] text-ink-muted mt-1">
                            en pedidos confirmados
                            {((kpis.accessory_units_sold ?? 0) > 0 || (kpis.combo_units_sold ?? 0) > 0) &&
                                ` (+${kpis.accessory_units_sold ?? 0} acc., +${kpis.combo_units_sold ?? 0} combos)`}
                        </p>
                    </div>

                    {/* Pendientes WhatsApp */}
                    <div className="bg-paper border border-paper-dark/70 rounded-xl p-4 shadow-2xs col-span-2 sm:col-span-1">
                        <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                            Pendientes WA
                        </span>
                        <div className="text-amber font-serif text-xl sm:text-2xl font-bold mt-1">
                            {kpis.pending_orders}
                        </div>
                        <p className="text-[10px] text-ink-muted mt-1">
                            solicitudes en curso &bull; {kpis.cancelled_orders} cancelados
                        </p>
                    </div>
                </div>

                {/* 3. Gráficos Interactivos con Recharts (Filtrables por período) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfico 1: Evolución Temporal de Ventas */}
                    <div className="bg-paper border border-paper-dark/70 rounded-2xl p-5 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-ink font-serif text-base font-bold">
                                    Evolución Temporal de Ventas
                                </h4>
                                <p className="text-ink-muted text-xs">
                                    Ventas confirmadas cronológicas en el período
                                </p>
                            </div>
                            <span className="text-[11px] font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded-md">
                                {period_label}
                            </span>
                        </div>

                        <div className="h-64 w-full pt-2">
                            {timeline.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                        <defs>
                                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2d5016" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#2d5016" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ede7d9" vertical={false} />
                                        <XAxis
                                            dataKey="label"
                                            stroke="#78716c"
                                            fontSize={11}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            stroke="#78716c"
                                            fontSize={11}
                                            tickLine={false}
                                            tickFormatter={(val) => `$${val >= 1000 ? Math.round(val / 1000) + 'k' : val}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                borderColor: '#e7dfd1',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                            }}
                                            formatter={(value, _name, item) => {
                                                const pedidos = (
                                                    item as { payload?: { pedidos?: number } } | undefined
                                                )?.payload?.pedidos;
                                                const suffix =
                                                    typeof pedidos === 'number' ? ` (${pedidos} pedidos)` : '';
                                                return [`${formatPrice(Number(value))}${suffix}`, 'Ventas'];
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="ventas"
                                            stroke="#2d5016"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorVentas)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-ink-muted">
                                    No hay ventas registradas en el período seleccionado.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gráfico 2: Distribución y Embudo de Pedidos */}
                    <div className="bg-paper border border-paper-dark/70 rounded-2xl p-5 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-ink font-serif text-base font-bold">
                                    Estado y Conversión de Pedidos
                                </h4>
                                <p className="text-ink-muted text-xs">
                                    Proporción de solicitudes según su estado en el período
                                </p>
                            </div>
                            <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                                {kpis.total_orders} pedidos
                            </span>
                        </div>

                        <div className="h-64 w-full pt-2">
                            {status_distribution.length > 0 && kpis.total_orders > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={status_distribution}
                                        margin={{ top: 10, right: 10, left: -15, bottom: 10 }}
                                    >
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
                                            formatter={(value, _, item) => [
                                                `${value} pedidos (${item.payload.porcentaje}%)`,
                                                'Volumen',
                                            ]}
                                        />
                                        <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                                            {status_distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-ink-muted">
                                    Sin solicitudes registradas en este período.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Tabs de Rankings y Listados Tácticos */}
                <div className="space-y-4">
                    {/* Mobile: Selector compacto sin scroll horizontal */}
                    <div className="sm:hidden">
                        <label htmlFor="reports-mobile-tab" className="text-ink-muted mb-1.5 block text-xs font-semibold">
                            Sección del reporte
                        </label>
                        <select
                            id="reports-mobile-tab"
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value as typeof activeTab)}
                            className="bg-paper border-paper-dark focus:border-forest focus:ring-forest/20 text-ink w-full rounded-xl border px-3.5 py-2.5 text-sm font-semibold shadow-2xs focus:ring-2 focus:outline-none"
                        >
                            <option value="customers">Top Compradores ({top_customers.length})</option>
                            <option value="best_selling">Libros Más Vendidos ({best_selling_books.length})</option>
                            <option value="least_selling">Menor Rotación ({least_selling_books.length})</option>
                            <option value="no_sales">Sin Ventas ({no_sales_books.length})</option>
                            <option value="critical">Alertas de Stock ({critical_stock.length})</option>
                        </select>
                    </div>

                    {/* Desktop: Tabs horizontales */}
                    <div className="border-b border-paper-dark/60 hidden sm:block">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                type="button"
                                onClick={() => setActiveTab('customers')}
                                className={`whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm font-medium transition cursor-pointer ${
                                    activeTab === 'customers'
                                        ? 'border-forest text-forest font-bold'
                                        : 'border-transparent text-ink-muted hover:border-paper-dark hover:text-ink'
                                }`}
                            >
                                Top Compradores ({top_customers.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('best_selling')}
                                className={`whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm font-medium transition cursor-pointer ${
                                    activeTab === 'best_selling'
                                        ? 'border-forest text-forest font-bold'
                                        : 'border-transparent text-ink-muted hover:border-paper-dark hover:text-ink'
                                }`}
                            >
                                Libros Más Vendidos ({best_selling_books.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('least_selling')}
                                className={`whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm font-medium transition cursor-pointer ${
                                    activeTab === 'least_selling'
                                        ? 'border-forest text-forest font-bold'
                                        : 'border-transparent text-ink-muted hover:border-paper-dark hover:text-ink'
                                }`}
                            >
                                Menor Rotación ({least_selling_books.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('no_sales')}
                                className={`whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm font-medium transition cursor-pointer ${
                                    activeTab === 'no_sales'
                                        ? 'border-forest text-forest font-bold'
                                        : 'border-transparent text-ink-muted hover:border-paper-dark hover:text-ink'
                                }`}
                            >
                                Sin Ventas ({no_sales_books.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('critical')}
                                className={`whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm font-medium transition cursor-pointer ${
                                    activeTab === 'critical'
                                        ? 'border-red-600 text-red-700 font-bold'
                                        : 'border-transparent text-ink-muted hover:border-paper-dark hover:text-ink'
                                }`}
                            >
                                Alertas de Stock ({critical_stock.length})
                            </button>
                        </nav>
                    </div>

                    {/* Tab 1: Top Customers */}
                    {activeTab === 'customers' && (
                        <div className="rounded-2xl border border-paper-dark/60 bg-paper-light overflow-hidden shadow-xs">
                            <div className="px-5 py-4 border-b border-paper-dark/40 bg-paper-light/70 flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif text-sm sm:text-base font-bold text-ink">
                                        Ranking de Clientes Destacados
                                    </h3>
                                    <p className="text-xs text-ink-muted">
                                        Clientes con más compras confirmadas durante el período ({period_label})
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-paper-dark/20 text-ink-muted uppercase font-semibold">
                                        <tr>
                                            <th className="px-4 py-3 text-center">#</th>
                                            <th className="px-4 py-3">Cliente</th>
                                            <th className="px-4 py-3">Contacto</th>
                                            <th className="px-4 py-3 text-center">DNI</th>
                                            <th className="px-4 py-3 text-center">Tipo</th>
                                            <th className="px-4 py-3 text-center">Pedidos</th>
                                            <th className="px-4 py-3 text-right">Total Confirmado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-paper-dark/40">
                                        {top_customers.length > 0 ? (
                                            top_customers.map((c, idx) => (
                                                <tr key={`${c.email}-${c.dni}-${idx}`} className="hover:bg-forest/5 transition">
                                                    <td className="px-4 py-3 text-center font-bold text-forest">
                                                        #{idx + 1}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-ink">
                                                        {c.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-ink-muted font-mono">
                                                        {c.email} &bull; {c.phone}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-mono text-stone-500">
                                                        {c.dni}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {c.is_registered ? (
                                                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                                                Registrado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                                                                Invitado
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold text-ink">
                                                        {c.orders_count}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-serif font-bold text-forest text-sm">
                                                        {formatPrice(c.total_spent)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
                                                    No se registran compras confirmadas para el período seleccionado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Best Selling Books */}
                    {activeTab === 'best_selling' && (
                        <div className="rounded-2xl border border-paper-dark/60 bg-paper-light overflow-hidden shadow-xs">
                            <div className="px-5 py-4 border-b border-paper-dark/40 bg-paper-light/70 flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif text-sm sm:text-base font-bold text-ink">
                                        Libros Más Vendidos
                                    </h3>
                                    <p className="text-xs text-ink-muted">
                                        Títulos con mayor volumen de unidades vendidas ({period_label})
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-paper-dark/20 text-ink-muted uppercase font-semibold">
                                        <tr>
                                            <th className="px-4 py-3 text-center">#</th>
                                            <th className="px-4 py-3">ISBN</th>
                                            <th className="px-4 py-3">Título</th>
                                            <th className="px-4 py-3">Autores</th>
                                            <th className="px-4 py-3">Género</th>
                                            <th className="px-4 py-3 text-center">Unidades</th>
                                            <th className="px-4 py-3 text-right">Ventas ($)</th>
                                            <th className="px-4 py-3 text-center">Stock Actual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-paper-dark/40">
                                        {best_selling_books.length > 0 ? (
                                            best_selling_books.map((b, idx) => (
                                                <tr key={b.id || idx} className="hover:bg-forest/5 transition">
                                                    <td className="px-4 py-3 text-center font-bold text-forest">
                                                        #{idx + 1}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                                                        {b.isbn}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-ink">{b.title}</td>
                                                    <td className="px-4 py-3 text-ink-muted">{b.authors}</td>
                                                    <td className="px-4 py-3 text-stone-500">{b.genre}</td>
                                                    <td className="px-4 py-3 text-center font-bold text-ink text-sm">
                                                        {b.units_sold}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-serif font-bold text-forest">
                                                        {formatPrice(b.total_revenue)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                b.stock <= 3
                                                                    ? 'bg-red-50 text-red-700'
                                                                    : 'bg-stone-100 text-stone-700'
                                                            }`}
                                                        >
                                                            {b.stock} un.
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-ink-muted">
                                                    No se registraron ventas de libros en el período seleccionado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Least Selling Books */}
                    {activeTab === 'least_selling' && (
                        <div className="rounded-2xl border border-paper-dark/60 bg-paper-light overflow-hidden shadow-xs">
                            <div className="px-5 py-4 border-b border-paper-dark/40 bg-paper-light/70 flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif text-sm sm:text-base font-bold text-ink">
                                        Libros con Menor Rotación
                                    </h3>
                                    <p className="text-xs text-ink-muted">
                                        Títulos activos con ventas registradas, ordenados de menor a mayor volumen ({period_label})
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-paper-dark/20 text-ink-muted uppercase font-semibold">
                                        <tr>
                                            <th className="px-4 py-3 text-center">#</th>
                                            <th className="px-4 py-3">ISBN</th>
                                            <th className="px-4 py-3">Título</th>
                                            <th className="px-4 py-3">Autores</th>
                                            <th className="px-4 py-3">Género</th>
                                            <th className="px-4 py-3 text-center">Unidades</th>
                                            <th className="px-4 py-3 text-right">Ventas ($)</th>
                                            <th className="px-4 py-3 text-center">Stock Actual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-paper-dark/40">
                                        {least_selling_books.length > 0 ? (
                                            least_selling_books.map((b, idx) => (
                                                <tr key={b.id || idx} className="hover:bg-amber-50/30 transition">
                                                    <td className="px-4 py-3 text-center font-bold text-amber-800">
                                                        #{idx + 1}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                                                        {b.isbn}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-ink">{b.title}</td>
                                                    <td className="px-4 py-3 text-ink-muted">{b.authors}</td>
                                                    <td className="px-4 py-3 text-stone-500">{b.genre}</td>
                                                    <td className="px-4 py-3 text-center font-bold text-ink text-sm">
                                                        {b.units_sold}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-serif font-bold text-forest">
                                                        {formatPrice(b.total_revenue)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold text-stone-700">
                                                        {b.stock} un.
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-ink-muted">
                                                    No se registraron libros con ventas en el período seleccionado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: No Sales */}
                    {activeTab === 'no_sales' && (
                        <div className="rounded-2xl border border-paper-dark/60 bg-paper-light overflow-hidden shadow-xs">
                            <div className="px-5 py-4 border-b border-paper-dark/40 bg-paper-light/70 flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif text-sm sm:text-base font-bold text-ink">
                                        Libros Sin Ventas
                                    </h3>
                                    <p className="text-xs text-ink-muted">
                                        Libros activos del catálogo que todavía no registran ventas en este período
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-paper-dark/20 text-ink-muted uppercase font-semibold">
                                        <tr>
                                            <th className="px-4 py-3">ISBN</th>
                                            <th className="px-4 py-3">Título</th>
                                            <th className="px-4 py-3">Autores</th>
                                            <th className="px-4 py-3">Género</th>
                                            <th className="px-4 py-3 text-right">Precio</th>
                                            <th className="px-4 py-3 text-center">Stock actual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-paper-dark/40">
                                        {no_sales_books.length > 0 ? (
                                            no_sales_books.map((b, idx) => (
                                                <tr key={b.id || idx} className="hover:bg-amber-50/30 transition">
                                                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                                                        {b.isbn}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-ink">{b.title}</td>
                                                    <td className="px-4 py-3 text-ink-muted">{b.authors}</td>
                                                    <td className="px-4 py-3 text-stone-500">{b.genre}</td>
                                                    <td className="px-4 py-3 text-right font-serif text-ink">
                                                        {formatPrice(b.price)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold text-amber-800">
                                                        {b.stock} unidades
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                                                    Todos los títulos del catálogo cuentan con al menos una venta registrada.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Critical Stock */}
                    {activeTab === 'critical' && (
                        <div className="rounded-2xl border border-red-200 bg-paper-light overflow-hidden shadow-xs">
                            <div className="px-5 py-4 border-b border-red-100 bg-red-50/60 flex items-center justify-between">
                                <div>
                                    <h3 className="font-serif text-sm sm:text-base font-bold text-red-900">
                                        Alertas de Stock
                                    </h3>
                                    <p className="text-xs text-red-700">
                                        Libros con stock igual a 0 (agotados) o en nivel crítico (≤ 3 unidades)
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-red-100/50 text-red-800 uppercase font-semibold">
                                        <tr>
                                            <th className="px-4 py-3">ISBN</th>
                                            <th className="px-4 py-3">Título</th>
                                            <th className="px-4 py-3">Autores</th>
                                            <th className="px-4 py-3 text-center">Stock Disponible</th>
                                            <th className="px-4 py-3 text-right">Precio</th>
                                            <th className="px-4 py-3 text-center">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-red-100">
                                        {critical_stock.length > 0 ? (
                                            critical_stock.map((s, idx) => (
                                                <tr key={s.id || idx} className="hover:bg-red-50/50 transition">
                                                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                                                        {s.isbn}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-ink">{s.title}</td>
                                                    <td className="px-4 py-3 text-ink-muted">{s.authors}</td>
                                                    <td className="px-4 py-3 text-center font-bold text-red-700 text-sm">
                                                        {s.stock}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-serif text-ink">
                                                        {formatPrice(s.price)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {s.stock === 0 ? (
                                                            <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">
                                                                Agotado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                                                                Stock Crítico
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-emerald-700">
                                                    Excelente: No hay títulos en condición de stock crítico.
                                                </td>
                                            </tr>
                                        )}
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
