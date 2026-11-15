<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de Rendimiento de Negocio - Alma Lectora</title>
    <style>
        @page {
            margin: 28px 32px;
            size: A4 portrait;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1c1917;
            font-size: 11px;
            line-height: 1.35;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #1e3a2f;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }
        .brand-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e3a2f;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin: 0;
        }
        .brand-subtitle {
            font-size: 9px;
            color: #57534e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 2px 0 0 0;
        }
        .doc-title {
            font-size: 14px;
            font-weight: bold;
            color: #1c1917;
            text-align: right;
            margin: 0;
        }
        .doc-meta {
            font-size: 10px;
            color: #57534e;
            text-align: right;
            margin: 2px 0 0 0;
        }

        /* KPI Cards Grid */
        .kpi-table {
            width: 100%;
            margin-bottom: 18px;
            border-collapse: separate;
            border-spacing: 6px;
        }
        .kpi-card {
            background-color: #f8faf8;
            border: 1px solid #d1ded6;
            border-radius: 6px;
            padding: 10px 12px;
            text-align: center;
            width: 25%;
        }
        .kpi-card.highlight {
            background-color: #eef5f1;
            border-color: #1e3a2f;
        }
        .kpi-label {
            font-size: 8.5px;
            text-transform: uppercase;
            font-weight: bold;
            color: #52665a;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .kpi-value {
            font-size: 16px;
            font-weight: bold;
            color: #1e3a2f;
        }
        .kpi-sub {
            font-size: 8px;
            color: #78857e;
            margin-top: 2px;
        }

        /* Section Headings */
        .section-header {
            background-color: #1e3a2f;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 5px 8px;
            margin-top: 14px;
            margin-bottom: 6px;
            border-radius: 3px;
        }

        /* Data Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            font-size: 10px;
        }
        .data-table thead {
            display: table-header-group;
        }
        .data-table tr {
            page-break-inside: avoid;
        }
        .section-header {
            page-break-after: avoid;
        }
        .data-table th {
            background-color: #2c4a3e;
            color: #ffffff;
            font-weight: bold;
            text-align: left;
            padding: 5px 6px;
            border: 1px solid #1e3a2f;
        }
        .data-table td {
            padding: 4px 6px;
            border: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        .data-table tr:nth-child(even) td {
            background-color: #f9faf8;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .font-bold {
            font-weight: bold;
        }

        .badge {
            display: inline-block;
            padding: 1px 6px;
            font-size: 8px;
            font-weight: bold;
            border-radius: 3px;
        }
        .badge-client {
            background-color: #dcfce7;
            color: #166534;
        }
        .badge-guest {
            background-color: #f3f4f6;
            color: #4b5563;
        }
        .badge-danger {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .badge-warning {
            background-color: #fef3c7;
            color: #92400e;
        }

        /* Footer */
        .footer-note {
            margin-top: 24px;
            font-size: 9px;
            color: #94a3b8;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td style="width: 55%; vertical-align: top;">
                <div class="brand-title">Alma Lectora</div>
                <div class="brand-subtitle">Editorial y Librería Universitaria &bull; PAW UNSa</div>
                <div style="font-size: 9px; color: #78716c; margin-top: 4px;">
                    Sede Central: Av. Bolivia 5150, Salta, Argentina &bull; contacto@almalectora.com
                </div>
            </td>
            <td style="width: 45%; vertical-align: top;">
                <div class="doc-title">INFORME DE RENDIMIENTO DE NEGOCIO</div>
                <div class="doc-meta">
                    <strong>Período:</strong> {{ $data['period_label'] ?? 'Histórico completo' }}<br>
                    <strong>Emitido:</strong> {{ $data['generated_at'] }}<br>
                    <strong>Generado por:</strong> {{ $data['generated_by'] ?? 'Sistema' }}
                </div>
            </td>
        </tr>
    </table>

    <!-- KPI Summary Grid -->
    <table class="kpi-table">
        <tr>
            <td class="kpi-card highlight">
                <div class="kpi-label">Ventas Confirmadas</div>
                <div class="kpi-value">${{ number_format($data['kpis']['total_revenue'], 2, ',', '.') }}</div>
                <div class="kpi-sub">{{ $data['kpis']['confirmed_orders'] }} pedidos confirmados</div>
            </td>
            <td class="kpi-card">
                <div class="kpi-label">Tasa de Confirmación</div>
                <div class="kpi-value">{{ $data['kpis']['conversion_rate'] }}%</div>
                <div class="kpi-sub">{{ $data['kpis']['confirmed_orders'] }} de {{ $data['kpis']['total_orders'] }} pedidos</div>
            </td>
            <td class="kpi-card">
                <div class="kpi-label">Ticket Promedio</div>
                <div class="kpi-value">${{ number_format($data['kpis']['average_ticket'], 2, ',', '.') }}</div>
                <div class="kpi-sub">Por pedido confirmado</div>
            </td>
            <td class="kpi-card">
                <div class="kpi-label">Libros Vendidos</div>
                <div class="kpi-value">{{ $data['kpis']['units_sold'] }}</div>
                <div class="kpi-sub">
                    En pedidos confirmados
                    @if(($data['kpis']['accessory_units_sold'] ?? 0) > 0 || ($data['kpis']['combo_units_sold'] ?? 0) > 0)
                        (+{{ $data['kpis']['accessory_units_sold'] ?? 0 }} acc., +{{ $data['kpis']['combo_units_sold'] ?? 0 }} combos)
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <!-- Top Customers -->
    <div class="section-header">1. Ranking de Clientes Destacados</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 5%;" class="text-center">#</th>
                <th style="width: 25%;">Cliente</th>
                <th style="width: 25%;">Email / Contacto</th>
                <th style="width: 15%;" class="text-center">DNI</th>
                <th style="width: 15%;" class="text-center">Cuenta</th>
                <th style="width: 15%;" class="text-right">Total Confirmado</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data['top_customers'] as $index => $customer)
                <tr>
                    <td class="text-center font-bold">{{ $index + 1 }}</td>
                    <td>{{ $customer['name'] }}</td>
                    <td>{{ $customer['email'] }}</td>
                    <td class="text-center">{{ $customer['dni'] }}</td>
                    <td class="text-center">
                        @if($customer['is_registered'])
                            <span class="badge badge-client">Registrado</span>
                        @else
                            <span class="badge badge-guest">Invitado</span>
                        @endif
                    </td>
                    <td class="text-right font-bold">${{ number_format($customer['total_spent'], 2, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center" style="padding: 10px; color: #64748b;">
                        No se registran compras confirmadas para calcular el ranking.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Top Selling Books -->
    <div class="section-header">2. Libros Más Vendidos</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 15%;">ISBN</th>
                <th style="width: 35%;">Título del Libro</th>
                <th style="width: 20%;">Autores</th>
                <th style="width: 10%;" class="text-center">Vendidos</th>
                <th style="width: 10%;" class="text-center">Stock</th>
                <th style="width: 10%;" class="text-right">Total ($)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data['best_selling_books'] as $book)
                <tr>
                    <td>{{ $book['isbn'] }}</td>
                    <td class="font-bold">{{ $book['title'] }}</td>
                    <td>{{ $book['authors'] }}</td>
                    <td class="text-center font-bold" style="color: #1e3a2f;">{{ $book['units_sold'] }}</td>
                    <td class="text-center">{{ $book['stock'] }}</td>
                    <td class="text-right">${{ number_format($book['total_revenue'], 2, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center" style="padding: 10px; color: #64748b;">
                        Aún no se registran unidades vendidas en órdenes confirmadas.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Critical Stock -->
    <div class="section-header" style="background-color: #991b1b;">3. Alertas de Stock (&le; 3 unidades)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 15%; background-color: #b91c1c;">ISBN</th>
                <th style="width: 45%; background-color: #b91c1c;">Título</th>
                <th style="width: 15%; background-color: #b91c1c;" class="text-center">Stock</th>
                <th style="width: 15%; background-color: #b91c1c;" class="text-right">Precio</th>
                <th style="width: 10%; background-color: #b91c1c;" class="text-center">Estado</th>
            </tr>
        </thead>
        <tbody>
            @forelse($data['critical_stock'] as $stock)
                <tr>
                    <td>{{ $stock['isbn'] }}</td>
                    <td>{{ $stock['title'] }}</td>
                    <td class="text-center font-bold" style="color: #b91c1c;">{{ $stock['stock'] }}</td>
                    <td class="text-right">${{ number_format($stock['price'], 2, ',', '.') }}</td>
                    <td class="text-center">
                        @if($stock['stock'] === 0)
                            <span class="badge badge-danger">Agotado</span>
                        @else
                            <span class="badge badge-warning">Crítico</span>
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center" style="padding: 10px; color: #64748b;">
                        No existen títulos con stock en nivel de alerta.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer-note" style="margin-top: 24px;">
        Alma Lectora &bull; Reporte emitido el {{ $data['generated_at'] }}
    </div>

</body>
</html>
