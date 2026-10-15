<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ExecutiveSummarySheet implements
    FromArray,
    WithHeadings,
    WithTitle,
    ShouldAutoSize,
    WithCustomStartCell,
    WithEvents
{
    protected array $kpis;

    public function __construct(array $kpis)
    {
        $this->kpis = $kpis;
    }

    public function title(): string
    {
        return 'Resumen Gerencial';
    }

    public function startCell(): string
    {
        return 'A5';
    }

    public function headings(): array
    {
        return [
            'Categoría Estratégica',
            'Indicador Clave (KPI)',
            'Valor Calculado',
            'Unidad de Medida',
            'Observación y Análisis',
        ];
    }

    public function array(): array
    {
        $k = $this->kpis;

        return [
            [
                'Rendimiento Comercial',
                'Ingresos Totales Facturados',
                (float) ($k['total_revenue'] ?? 0),
                'ARS ($)',
                'Importe neto acumulado de pedidos confirmados',
            ],
            [
                'Rendimiento Comercial',
                'Ticket Promedio por Pedido',
                (float) ($k['average_ticket'] ?? 0),
                'ARS ($)',
                'Ingreso medio obtenido en cada transacción confirmada',
            ],
            [
                'Volumen de Operaciones',
                'Total de Pedidos Registrados',
                (int) ($k['total_orders'] ?? 0),
                'Pedidos',
                'Volumen total de pedidos ingresados al sistema',
            ],
            [
                'Volumen de Operaciones',
                'Pedidos Confirmados y Despachados',
                (int) ($k['confirmed_orders'] ?? 0),
                'Pedidos',
                'Pedidos cerrados exitosamente con entrega o pago',
            ],
            [
                'Volumen de Operaciones',
                'Pedidos Pendientes (WhatsApp)',
                (int) ($k['pending_orders'] ?? 0),
                'Pedidos',
                'Operaciones en etapa de contacto y confirmación',
            ],
            [
                'Volumen de Operaciones',
                'Pedidos Cancelados',
                (int) ($k['cancelled_orders'] ?? 0),
                'Pedidos',
                'Pedidos desestimados por el comprador o falta de stock',
            ],
            [
                'Efectividad Comercial',
                'Tasa de Conversión WhatsApp',
                ($k['total_orders'] ?? 0) > 0 ? (($k['confirmed_orders'] ?? 0) / ($k['total_orders'] ?? 1)) : 0,
                'Porcentaje (%)',
                'Efectividad de cierre sobre los pedidos iniciados',
            ],
            [
                'Catálogo e Inventario',
                'Unidades Físicas de Libros Vendidas',
                (int) ($k['units_sold'] ?? 0),
                'Ejemplares',
                'Cantidad total de volúmenes vendidos en órdenes confirmadas',
            ],
            [
                'Catálogo e Inventario',
                'Variedad de Catálogo Activo',
                (int) ($k['catalog_size'] ?? 0),
                'Títulos',
                'Catálogo de libros disponibles para la venta',
            ],
            [
                'Catálogo e Inventario',
                'Títulos con Stock Crítico (<= 3)',
                (int) ($k['critical_stock_count'] ?? 0),
                'Títulos',
                'Alerta de reposición inmediata en bodega',
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // 1. Banner Superior (A1:E1)
                $sheet->mergeCells('A1:E1');
                $sheet->setCellValue('A1', 'ALMA LECTORA  |  INFORME GERENCIAL Y RENDIMIENTO DE NEGOCIO');
                $sheet->getRowDimension(1)->setRowHeight(36);

                $sheet->getStyle('A1')->applyFromArray([
                    'font' => [
                        'name' => 'Segoe UI',
                        'bold' => true,
                        'size' => 14,
                        'color' => ['argb' => 'FFFFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF1E3A2F'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // 2. Metadatos (A2:E2)
                $sheet->mergeCells('A2:E2');
                $now = now()->format('d/m/Y H:i:s');
                $user = auth()->user()?->name ?? 'Dirección';
                $sheet->setCellValue('A2', "Reporte emitido el {$now} | Responsable: {$user} | Alcance: Histórico Consolidado");
                $sheet->getRowDimension(2)->setRowHeight(20);

                $sheet->getStyle('A2')->applyFromArray([
                    'font' => [
                        'name' => 'Segoe UI',
                        'italic' => true,
                        'size' => 9,
                        'color' => ['argb' => 'FF374151'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FFF1F5F2'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                $sheet->getRowDimension(3)->setRowHeight(8);
                $sheet->getRowDimension(4)->setRowHeight(8);

                // 3. Cabeceras (A5:E5)
                $sheet->getRowDimension(5)->setRowHeight(26);
                $sheet->getStyle('A5:E5')->applyFromArray([
                    'font' => [
                        'name' => 'Segoe UI',
                        'bold' => true,
                        'size' => 10,
                        'color' => ['argb' => 'FFFFFFFF'],
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FF2C4A3E'],
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                    'borders' => [
                        'bottom' => [
                            'borderStyle' => Border::BORDER_MEDIUM,
                            'color' => ['argb' => 'FF1E3A2F'],
                        ],
                    ],
                ]);

                // 4. Filas de datos (Rows 6 a 15)
                for ($r = 6; $r <= 15; $r++) {
                    $sheet->getRowDimension($r)->setRowHeight(22);

                    if ($r % 2 === 0) {
                        $sheet->getStyle("A{$r}:E{$r}")->getFill()->applyFromArray([
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['argb' => 'FFF9FAF8'],
                        ]);
                    }

                    $sheet->getStyle("A{$r}:E{$r}")->getBorders()->applyFromArray([
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FFE5E7EB'],
                        ],
                    ]);

                    $sheet->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    $sheet->getStyle("B{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    $sheet->getStyle("C{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("D{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getStyle("E{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                }

                // Formatos contables y fórmulas en columna C
                $sheet->getStyle('C6')->getNumberFormat()->setFormatCode('"$"#,##0.00'); // Ingresos
                $sheet->setCellValue('C7', '=IF(C9>0, C6/C9, 0)');                         // Ticket Promedio dinámico
                $sheet->getStyle('C7')->getNumberFormat()->setFormatCode('"$"#,##0.00');
                $sheet->getStyle('C8:C11')->getNumberFormat()->setFormatCode('#,##0');    // Pedidos
                $sheet->setCellValue('C12', '=IF(C8>0, C9/C8, 0)');                        // Conversión dinámica
                $sheet->getStyle('C12')->getNumberFormat()->setFormatCode('0.0%');
                $sheet->getStyle('C13:C15')->getNumberFormat()->setFormatCode('#,##0');   // Libros / Stock

                // Resaltar stock crítico en fila 15
                $sheet->getStyle('C15')->getFont()->setBold(true)->getColor()->setARGB('FFB91C1C');

                $sheet->freezePane('A6');
            },
        ];
    }
}
