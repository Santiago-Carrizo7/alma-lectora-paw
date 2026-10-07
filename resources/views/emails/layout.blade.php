<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Alma Lectora' }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f0e8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; width: 100% !important;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f0e8; padding: 36px 12px;">
        <tr>
            <td align="center">
                <!-- Contenedor Principal (Max 600px) -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06); border: 1px solid #e7dfd1;">
                    <!-- Encabezado Editorial -->
                    <tr>
                        <td style="background-color: #2d5016; padding: 26px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                                Alma Lectora
                            </h1>
                            <p style="margin: 4px 0 0 0; color: #d4e8c1; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                                Plataforma Web Editorial & Librería
                            </p>
                        </td>
                    </tr>

                    <!-- Contenido Dinámico -->
                    <tr>
                        <td style="padding: 32px 30px; color: #1c1917; font-size: 14px; line-height: 1.6;">
                            @yield('content')
                        </td>
                    </tr>

                    <!-- Pie de página -->
                    <tr>
                        <td style="background-color: #ede7d9; padding: 20px 30px; text-align: center; border-top: 1px solid #e7dfd1; color: #57534e; font-size: 11px;">
                            <p style="margin: 0 0 4px 0; font-weight: 600; color: #1c1917;">
                                Alma Lectora &bull; Salta, Argentina
                            </p>
                            <p style="margin: 0; color: #78716c;">
                                WhatsApp de Atención: +54 9 387 570-8557 &bull; Este es un correo automático de confirmación de tu pedido.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
