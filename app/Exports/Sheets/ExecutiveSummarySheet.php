<?php

namespace App\Exports\Sheets;

use App\Exports\Concerns\FormulaSafeValueBinder;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ExecutiveSummarySheet extends DefaultValueBinder implements
    FromArray,
    WithHeadings,
    WithTitle,
    ShouldAutoSize,
    WithCustomStartCell,
    WithEvents,
    WithCustomValueBinder
{
    use FormulaSafeValueBinder;

    protected array $kpis;
    protected string $periodLabel;
    protected string $generatedAt;
    protected string $generatedBy;

    public function __construct(
        array $kpis,
        string $periodLabel = 'Período seleccionado',
        string $generatedAt = '',
        string $generatedBy = 'Sistema Administrativo'
    ) {
        $this->kpis = $kpis;
        $this->periodLabel = $periodLabel;
        $this->generatedAt = $generatedAt ?: now()->format('d/m/Y H:i:s');
        $this->generatedBy = $generatedBy;
    }

    public function title(): string
    {
        return 'Resumen General';
    }

    public function startCell(): string
    {
        return 'A5';
    }

    public function headings(): array
    {
        return [
            'Categoría',
            'Indicador',
            'Valor',
            'Unidad',
            'Detalle',
        ];
    }

    public function array(): array
    {
        $k = $this->kpis;

        return [
            [
                'Ventas',
                'Ventas confirmadas',
                (float) ($k['total_revenue'] ?? 0),
                'ARS ($)',
                'Total acumulado en pedidos confirmados en el período',
            ],
            [
                'Ventas',
                'Ticket promedio',
                (float) ($k['average_ticket'] ?? 0),
                'ARS ($)',
                'Promedio por pedido confirmado',
            ],
            [
                'Pedidos',
                'Total de pedidos',
                (int) ($k['total_orders'] ?? 0),
                'Pedidos',
                'Cantidad total de pedidos recibidos en el período',
            ],
            [
                'Pedidos',
                'Pedidos confirmados',
                (int) ($k['confirmed_orders'] ?? 0),
                'Pedidos',
                'Compras confirmadas en el período',
            ],
            [
                'Pedidos',
                'Pedidos pendientes WhatsApp',
                (int) ($k['pending_orders'] ?? 0),
                'Pedidos',
                'En espera de confirmación',
            ],
            [
                'Pedidos',
                'Pedidos cancelados',
                (int) ($k['cancelled_orders'] ?? 0),
                'Pedidos',
                'Pedidos que no se concretaron',
            ],
            [
                'Efectividad',
                'Tasa de confirmación',
                (float) ($k['conversion_rate'] ?? 0),
                'Porcentaje (%)',
                'Pedidos confirmados sobre total recibido',
            ],
            [
                'Catálogo y Stock',
                'Libros vendidos',
                (int) ($k['units_sold'] ?? 0),
                'Ejemplares',
                sprintf(
                    'Solo libros en pedidos confirmados (+%d acc. / %d combos)',
                    (int) ($k['accessory_units_sold'] ?? 0),
                    (int) ($k['combo_units_sold'] ?? 0)
                ),
            ],
            [
                'Catálogo y Stock',
                'Libros activos en catálogo',
                (int) ($k['catalog_size'] ?? 0),
                'Libros',
                'Libros publicados y no archivados',
            ],
            [
                'Catálogo y Stock',
                'Libros con stock crítico (<= 3)',
                (int) ($k['critical_stock_count'] ?? 0),
                'Libros',
                'Libros activos con 3 o menos unidades',
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
                $sheet->setCellValue('A1', 'ALMA LECTORA  |  INFORME DE RENDIMIENTO DE NEGOCIO');
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
                $sheet->setCellValue('A2', "Período: {$this->periodLabel} | Emitido: {$this->generatedAt} | Por: {$this->generatedBy}");
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

                // Formatos numéricos y contables (sin fórmulas sin caché para garantizar paridad al leer celdas)
                $sheet->getStyle('C6:C7')->getNumberFormat()->setFormatCode('"$"#,##0.00'); // Ventas y Ticket
                $sheet->getStyle('C8:C11')->getNumberFormat()->setFormatCode('#,##0');    // Pedidos
                $sheet->getStyle('C12')->getNumberFormat()->setFormatCode('0.0"%"');      // Tasa confirmación
                $sheet->getStyle('C13:C15')->getNumberFormat()->setFormatCode('#,##0');   // Libros / Stock

                // Resaltar stock crítico en fila 15
                $sheet->getStyle('C15')->getFont()->setBold(true)->getColor()->setARGB('FFB91C1C');

                $sheet->freezePane('A6');
            },
        ];
    }
}
