<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Remito de Despacho #{{ substr($order->id, 0, 8) }} - Alma Lectora</title>
    <style>
        @page {
            margin: 28px 32px;
            size: A4 portrait;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1c1917;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #2d5016;
            padding-bottom: 14px;
            margin-bottom: 18px;
        }
        .brand-title {
            font-size: 22px;
            font-weight: bold;
            color: #2d5016;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin: 0;
        }
        .brand-subtitle {
            font-size: 10px;
            color: #57534e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 2px 0 0 0;
        }
        .doc-title {
            font-size: 15px;
            font-weight: bold;
            color: #1c1917;
            text-align: right;
            margin: 0;
        }
        .doc-meta {
            font-size: 11px;
            color: #57534e;
            text-align: right;
            margin: 3px 0 0 0;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            font-size: 10px;
            font-weight: bold;
            border-radius: 4px;
            background-color: #ede7d9;
            color: #2d5016;
            margin-top: 4px;
        }
        .section-box {
            background-color: #f5f0e8;
            border: 1px solid #e7dfd1;
            border-radius: 6px;
            padding: 12px 14px;
            margin-bottom: 18px;
        }
        .section-title {
            font-size: 11px;
            font-weight: bold;
            color: #2d5016;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 8px 0;
            border-bottom: 1px solid #dcd4c3;
            padding-bottom: 4px;
        }
        .info-grid {
            width: 100%;
        }
        .info-label {
            font-size: 10px;
            color: #78716c;
            text-transform: uppercase;
            font-weight: bold;
            width: 25%;
            padding: 3px 0;
        }
        .info-value {
            font-size: 11px;
            color: #1c1917;
            font-weight: 500;
            padding: 3px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 16px;
        }
        .items-table th {
            background-color: #2d5016;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: left;
            padding: 8px 10px;
        }
        .items-table td {
            border-bottom: 1px solid #e7dfd1;
            padding: 8px 10px;
            font-size: 11px;
        }
        .items-table tr:nth-child(even) td {
            background-color: #faf8f5;
        }
        .check-box {
            width: 14px;
            height: 14px;
            border: 1px solid #a8a29e;
            border-radius: 2px;
            display: inline-block;
        }
        .totals-table {
            width: 100%;
            margin-top: 8px;
        }
        .total-amount {
            font-size: 15px;
            font-weight: bold;
            color: #2d5016;
            text-align: right;
            padding: 6px 10px;
        }
        .total-label {
            font-size: 12px;
            font-weight: bold;
            color: #1c1917;
            text-align: right;
            text-transform: uppercase;
            padding: 6px 10px;
        }
        .footer-table {
            width: 100%;
            margin-top: 24px;
            border-top: 1px dashed #dcd4c3;
            padding-top: 14px;
        }
        .footer-note {
            font-size: 9px;
            color: #78716c;
            line-height: 1.3;
        }
        .sign-box {
            border-top: 1px solid #1c1917;
            width: 160px;
            text-align: center;
            font-size: 10px;
            color: #57534e;
            padding-top: 4px;
            margin-top: 30px;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <table class="header-table" cellpadding="0" cellspacing="0">
        <tr>
            <td style="vertical-align: top;">
                <h1 class="brand-title">Alma Lectora</h1>
                <p class="brand-subtitle">Plataforma Web Editorial & Librería</p>
            </td>
            <td style="vertical-align: top; text-align: right;">
                <p class="doc-title">REMITO DE DESPACHO</p>
                <p class="doc-meta"><strong>Orden:</strong> #{{ strtoupper(substr($order->id, 0, 8)) }}</p>
                <p class="doc-meta"><strong>Fecha:</strong> {{ $order->created_at->format('d/m/Y H:i') }} hs</p>
                <span class="status-badge">
                    Estado: {{ $order->status === 'CONFIRMED' ? 'CONFIRMADO' : ($order->status === 'CANCELLED' ? 'CANCELADO' : 'PENDIENTE WHATSAPP') }}
                </span>
            </td>
        </tr>
    </table>

    <!-- Destinatario / Envío -->
    <div class="section-box">
        <div class="section-title">Datos del Destinatario y Entrega</div>
        <table class="info-grid" cellpadding="0" cellspacing="0">
            <tr>
                <td class="info-label">Cliente:</td>
                <td class="info-value"><strong>{{ $order->customer_name }}</strong></td>
                <td class="info-label">DNI:</td>
                <td class="info-value">{{ $order->customer_dni ?: 'No informado' }}</td>
            </tr>
            <tr>
                <td class="info-label">Teléfono:</td>
                <td class="info-value">{{ $order->customer_phone }}</td>
                <td class="info-label">Email:</td>
                <td class="info-value">{{ $order->customer_email ?: 'No informado' }}</td>
            </tr>
            <tr>
                <td class="info-label">Dirección:</td>
                <td class="info-value">{{ $order->address ?: 'Retiro en punto / A convenir' }}</td>
                <td class="info-label">Código Postal:</td>
                <td class="info-value">{{ $order->postal_code ?: '-' }}</td>
            </tr>
        </table>
    </div>

    <!-- Lista de Artículos para Packing -->
    <div style="margin-bottom: 6px;">
        <strong style="text-transform: uppercase; font-size: 11px; color: #2d5016; letter-spacing: 0.5px;">
            Artículos a Preparar (Checklist de Empaque)
        </strong>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 32px; text-align: center;">Ok</th>
                <th style="width: 75px;">Tipo</th>
                <th>Descripción / Título</th>
                <th style="width: 50px; text-align: center;">Cant.</th>
                <th style="width: 80px; text-align: right;">Unitario</th>
                <th style="width: 90px; text-align: right;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($order->items as $item)
                @php
                    $unitPrice = floatval($item['unit_price'] ?? ($item['price'] ?? 0));
                    $qty = intval($item['quantity'] ?? 1);
                    $subtotal = $unitPrice * $qty;
                @endphp
                <tr>
                    <td style="text-align: center;">
                        <span class="check-box"></span>
                    </td>
                    <td style="font-size: 10px; color: #57534e; text-transform: uppercase;">
                        {{ $item['type'] ?? 'PRODUCTO' }}
                    </td>
                    <td>
                        <strong>{{ $item['title'] ?? 'Sin título' }}</strong>
                    </td>
                    <td style="text-align: center; font-weight: bold;">
                        {{ $qty }}
                    </td>
                    <td style="text-align: right;">
                        ${{ number_format($unitPrice, 2, ',', '.') }}
                    </td>
                    <td style="text-align: right; font-weight: bold;">
                        ${{ number_format($subtotal, 2, ',', '.') }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" style="text-align: center; padding: 12px; color: #78716c;">
                        No se detallaron artículos para esta orden.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Totales -->
    <table class="totals-table" cellpadding="0" cellspacing="0">
        <tr>
            <td style="width: 65%;"></td>
            <td class="total-label" style="border-top: 2px solid #2d5016;">Total a Cobrar / Pactado:</td>
            <td class="total-amount" style="border-top: 2px solid #2d5016; width: 110px;">
                ${{ number_format($order->total_amount, 2, ',', '.') }}
            </td>
        </tr>
    </table>

    <!-- Control de Despacho y Footer -->
    <table class="footer-table" cellpadding="0" cellspacing="0">
        <tr>
            <td style="width: 60%; vertical-align: top;">
                <p class="footer-note">
                    <strong>Aviso operativo:</strong> Este remito no constituye factura fiscal. Es una orden de preparación y comprobante de despacho interno para envíos por correo, cadetería o retiro en tienda.
                </p>
                <p class="footer-note" style="margin-top: 4px;">
                    Coordinación de entrega y comprobante de transferencia acordados por WhatsApp oficial: <strong>+54 9 387 570-8557</strong>.
                </p>
            </td>
            <td style="width: 40%; vertical-align: top; text-align: right;">
                <div style="display: inline-block;">
                    <div class="sign-box">Control de Empaque / Firma</div>
                </div>
            </td>
        </tr>
    </table>

</body>
</html>
