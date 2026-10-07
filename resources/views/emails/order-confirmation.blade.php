@extends('emails.layout', ['title' => '¡Recibimos tu pedido en Alma Lectora!'])

@section('content')
    <h2 style="margin-top: 0; margin-bottom: 12px; font-size: 18px; color: #2d5016; font-weight: 700;">
        ¡Gracias por elegirnos, {{ $order->customer_name }}! 📖
    </h2>

    <p style="margin-top: 0; margin-bottom: 20px; color: #44403c; line-height: 1.6;">
        Recibimos exitosamente tu solicitud de compra. Tus ejemplares y complementos ya han sido apartados en nuestro inventario para que nadie más los reserve.
    </p>

    <!-- Caja de Resumen del Pedido -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fcfbf9; border-radius: 8px; border: 1px solid #e7dfd1; margin-bottom: 24px;">
        <tr>
            <td style="padding: 16px 20px;">
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #78716c; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
                    Número de Orden
                </p>
                <p style="margin: 0; font-size: 16px; color: #2d5016; font-weight: 700; font-family: monospace;">
                    #{{ strtoupper(substr($order->id, 0, 8)) }}
                </p>
            </td>
            <td style="padding: 16px 20px; text-align: right;">
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #78716c; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
                    Fecha y Hora
                </p>
                <p style="margin: 0; font-size: 13px; color: #1c1917; font-weight: 600;">
                    {{ $order->created_at->format('d/m/Y H:i') }} hs
                </p>
            </td>
        </tr>
        @if($order->address)
            <tr>
                <td colspan="2" style="padding: 0 20px 16px 20px; border-top: 1px dashed #e7dfd1; padding-top: 12px;">
                    <span style="font-size: 11px; color: #78716c; text-transform: uppercase; font-weight: 700;">Dirección de Envío:</span>
                    <span style="font-size: 13px; color: #1c1917; font-weight: 500;">{{ $order->address }} {{ $order->postal_code ? '(CP: ' . $order->postal_code . ')' : '' }}</span>
                </td>
            </tr>
        @endif
    </table>

    <!-- Tabla de Artículos -->
    <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #2d5016; text-transform: uppercase; letter-spacing: 0.5px;">
        Detalle de Artículos Solicitados:
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e7dfd1; border-radius: 6px; overflow: hidden;">
        <thead>
            <tr style="background-color: #ede7d9;">
                <th style="padding: 10px 14px; text-align: left; font-size: 11px; color: #1c1917; text-transform: uppercase;">Producto</th>
                <th style="padding: 10px 14px; text-align: center; font-size: 11px; color: #1c1917; text-transform: uppercase; width: 60px;">Cant.</th>
                <th style="padding: 10px 14px; text-align: right; font-size: 11px; color: #1c1917; text-transform: uppercase; width: 90px;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
                @php
                    $unitPrice = floatval($item['unit_price'] ?? ($item['price'] ?? 0));
                    $qty = intval($item['quantity'] ?? 1);
                    $subtotal = $unitPrice * $qty;
                @endphp
                <tr style="border-bottom: 1px solid #f0eae1;">
                    <td style="padding: 10px 14px; font-size: 13px; color: #1c1917;">
                        <strong>{{ $item['title'] ?? 'Producto' }}</strong>
                        @if(!empty($item['type']))
                            <div style="font-size: 10px; color: #78716c; text-transform: uppercase; margin-top: 2px;">{{ $item['type'] }}</div>
                        @endif
                    </td>
                    <td style="padding: 10px 14px; text-align: center; font-size: 13px; color: #1c1917; font-weight: 600;">
                        {{ $qty }}
                    </td>
                    <td style="padding: 10px 14px; text-align: right; font-size: 13px; color: #b45309; font-weight: 700;">
                        ${{ number_format($subtotal, 2, ',', '.') }}
                    </td>
                </tr>
            @endforeach
            <tr style="background-color: #faf8f5;">
                <td colspan="2" style="padding: 14px; text-align: right; font-size: 13px; font-weight: 700; color: #1c1917;">
                    TOTAL DEL PEDIDO:
                </td>
                <td style="padding: 14px; text-align: right; font-size: 16px; font-weight: 800; color: #2d5016;">
                    ${{ number_format($order->total_amount, 2, ',', '.') }}
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Caja Informativa de WhatsApp / Siguientes Pasos -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f8ed; border-left: 4px solid #2d5016; border-radius: 4px; margin-bottom: 24px;">
        <tr>
            <td style="padding: 16px 20px;">
                <p style="margin: 0 0 6px 0; color: #2d5016; font-size: 13px; font-weight: 700;">
                    📲 Próximo paso: Coordinación por WhatsApp
                </p>
                <p style="margin: 0; color: #374151; font-size: 12px; line-height: 1.5;">
                    Nos comunicaremos contigo a tu teléfono <strong>{{ $order->customer_phone }}</strong> para confirmar el pedido, verificar el medio de pago (transferencia o efectivo) y ultimar detalles de la entrega. Si lo preferís, también podés escribirnos directamente haciendo clic a continuación.
                </p>
            </td>
        </tr>
    </table>

    <p style="margin: 0; color: #57534e; font-size: 13px; text-align: center;">
        ¡Gracias por apoyar a <strong>Alma Lectora</strong> y fomentar el amor por la lectura! ✨
    </p>
@endsection
