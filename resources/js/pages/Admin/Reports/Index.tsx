import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
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
    catalog_size: number;
    critical_stock_count: number;
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
        kpis: KpiData;
        top_customers: CustomerData[];
        best_selling_books: BookSalesData[];
        least_selling_books: BookSalesData[];
        no_sales_books: BookSalesData[];
        critical_stock: CriticalStockData[];
        generated_at: string;
        generated_by: string;
    };
}

export default function ReportsIndex({ report }: ReportProps) {
    const [activeTab, setActiveTab] = useState<'customers' | 'best_selling' | 'no_sales' | 'critical'>(
        'customers'
    );

    const { kpis, top_customers, best_selling_books, no_sales_books, critical_stock } = report;

    const actionButtons = (
        <div className="flex flex-wrap items-center gap-2">
            <a
                href="/admin/reportes/pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 shadow-xs transition hover:bg-red-100"
                title="Descargar reporte en PDF"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5h6m-6 3h4" />
                </svg>
                <span>Descargar PDF</span>
            </a>

            <a
                href="/admin/reportes/excel"
                className="inline-flex items-center gap-2 rounded-xl bg-forest px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-forest-dark"
                title="Descargar reporte en Excel"
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
            title="Reportes y Estadísticas"
            subtitle="Ventas, clientes destacados y estado del inventario"
            breadcrumbText="Volver al Panel Central"
            breadcrumbHref="/admin"
            action={actionButtons}
        >
            <Head title="Reportes y Estadísticas - Alma Lectora" />

            <div className="space-y-6">
                {/* Tabs Navigation */}
                <div className="border-b border-paper-dark/60">
                    <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('customers')}
                            className={`whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm font-medium transition ${
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
                            className={`whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm font-medium transition ${
                                activeTab === 'best_selling'
                                    ? 'border-forest text-forest font-bold'
                                    : 'border-transparent text-ink-muted hover:border-paper-dark hover:text-ink'
                            }`}
                        >
                            Libros Más Vendidos ({best_selling_books.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('no_sales')}
                            className={`whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm font-medium transition ${
                                activeTab === 'no_sales'
                                    ? 'border-forest text-forest font-bold'
                                    : 'border-transparent text-ink-muted hover:border-paper-dark hover:text-ink'
                            }`}
                        >
                            Sin Ventas / Menor Rotación ({no_sales_books.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('critical')}
                            className={`whitespace-nowrap border-b-2 py-3 px-1 text-xs sm:text-sm font-medium transition ${
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
                                    Clientes con más compras confirmadas en la tienda
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
                                        <th className="px-4 py-3 text-right">Total Facturado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-paper-dark/40">
                                    {top_customers.length > 0 ? (
                                        top_customers.map((c, idx) => (
                                            <tr key={idx} className="hover:bg-forest/5 transition">
                                                <td className="px-4 py-3 text-center font-bold text-forest">
                                                    #{idx + 1}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-ink">
                                                    {c.name}
                                                </td>
                                                <td className="px-4 py-3 text-ink-muted">
                                                    <div>{c.email}</div>
                                                    <div className="text-[11px] text-stone-400">{c.phone}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-xs text-ink">
                                                    {c.dni}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {c.is_registered ? (
                                                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                                                            Registrado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600 border border-stone-200">
                                                            Invitado
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold text-ink">
                                                    {c.orders_count}
                                                </td>
                                                <td className="px-4 py-3 text-right font-serif font-bold text-forest">
                                                    {formatPrice(c.total_spent)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
                                                No se registran compras confirmadas para generar el ranking.
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
                                    Los libros con mayor cantidad de unidades vendidas
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-paper-dark/20 text-ink-muted uppercase font-semibold">
                                    <tr>
                                        <th className="px-4 py-3 text-center">Top</th>
                                        <th className="px-4 py-3">ISBN</th>
                                        <th className="px-4 py-3">Título del Libro</th>
                                        <th className="px-4 py-3">Autores</th>
                                        <th className="px-4 py-3 text-center">Unidades</th>
                                        <th className="px-4 py-3 text-right">Facturación</th>
                                        <th className="px-4 py-3 text-center">Stock actual</th>
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
                                                <td className="px-4 py-3 text-center font-bold text-forest text-sm">
                                                    {b.units_sold}
                                                </td>
                                                <td className="px-4 py-3 text-right font-serif font-bold text-ink">
                                                    {formatPrice(b.total_revenue)}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono">
                                                    {b.stock}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">
                                                Aún no se registran unidades vendidas en pedidos confirmados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 3: No Sales */}
                {activeTab === 'no_sales' && (
                    <div className="rounded-2xl border border-paper-dark/60 bg-paper-light overflow-hidden shadow-xs">
                        <div className="px-5 py-4 border-b border-paper-dark/40 bg-paper-light/70 flex items-center justify-between">
                            <div>
                                <h3 className="font-serif text-sm sm:text-base font-bold text-ink">
                                    Libros con Menor Rotación (Sin Ventas)
                                </h3>
                                <p className="text-xs text-ink-muted">
                                    Libros del catálogo que todavía no registran ventas
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
                                    Libros con 3 o menos unidades disponibles o agotados
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
        </AdminLayout>
    );
}
