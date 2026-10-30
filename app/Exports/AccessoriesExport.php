<?php

namespace App\Exports;

use App\Models\Accessory;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class AccessoriesExport implements
    FromQuery,
    WithHeadings,
    WithMapping,
    ShouldAutoSize,
    WithCustomStartCell,
    WithColumnFormatting,
    WithEvents,
    WithTitle
{
    use Exportable;

    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query(): Builder
    {
        $tab = $this->filters['tab'] ?? 'available';

        $query = $tab === 'archived'
            ? Accessory::onlyTrashed()
            : Accessory::withoutTrashed();

        return $query->with('category')->filter([
            'search' => $this->filters['search'] ?? null,
            'category' => $this->filters['category'] ?? null,
        ])->latest();
    }

    public function startCell(): string
    {
        return 'A5';
    }

    public function title(): string
    {
        return 'Catálogo de Accesorios';
    }

    public function headings(): array
    {
        return [
            'ID',
            'Título',
            'Categoría',
            'Precio Unitario ($)',
            'Stock Disponible',
            'Estado',
            'Descripción',
        ];
    }

    public function map($accessory): array
    {
        $status = $accessory->trashed() ? 'Archivado' : ($accessory->is_active ? 'Activo' : 'Inactivo');

        return [
            $accessory->id,
            $accessory->title,
            $accessory->category?->label ?? $accessory->category_label ?? 'General',
            (float) $accessory->price,
            (int) $accessory->stock,
            $status,
            $accessory->description ?: '-',
        ];
    }

    public function columnFormats(): array
    {
        return [
            'D' => '"$"#,##0.00',
            'E' => '#,##0',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $highestRow = $sheet->getHighestRow();
                $tab = $this->filters['tab'] ?? 'available';
                $tabLabel = $tab === 'archived' ? 'Accesorios Archivados' : 'Catálogo Activo';
                $search = !empty($this->filters['search']) ? $this->filters['search'] : 'Todos';
                $userName = auth()->user()?->name ?? 'Administración';
                $generatedAt = now()->format('d/m/Y H:i:s');

                // 1. Banner Institucional Principal (A1:G1)
                $sheet->mergeCells('A1:G1');
                $sheet->setCellValue('A1', 'ALMA LECTORA  |  CATÁLOGO GENERAL DE ACCESORIOS');
                $sheet->getRowDimension(1)->setRowHeight(38);

                $sheet->getStyle('A1')->applyFromArray([
                    'font' => [
                        'name' => 'Segoe UI',
                        'bold' => true,
                        'size' => 15,
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

                // 2. Metadatos y Filtros (A2:G2)
                $sheet->mergeCells('A2:G2');
                $metaText = "Generado: {$generatedAt} | Usuario: {$userName} | Vista: {$tabLabel} | Filtro: \"{$search}\"";
                $sheet->setCellValue('A2', $metaText);
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

                // 3. Fila separadora (A3:G3, A4:G4)
                $sheet->getRowDimension(3)->setRowHeight(8);
                $sheet->getRowDimension(4)->setRowHeight(8);

                // 4. Encabezados de Tabla (A5:G5)
                $sheet->getRowDimension(5)->setRowHeight(28);
                $sheet->getStyle('A5:G5')->applyFromArray([
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

                // 5. Filas de Datos (Row 6 hasta $highestRow)
                if ($highestRow >= 6) {
                    for ($r = 6; $r <= $highestRow; $r++) {
                        $sheet->getRowDimension($r)->setRowHeight(21);

                        // Zebra striping para filas pares
                        if ($r % 2 === 0) {
                            $sheet->getStyle("A{$r}:G{$r}")->getFill()->applyFromArray([
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['argb' => 'FFF9FAF8'],
                            ]);
                        }

                        $sheet->getStyle("A{$r}:G{$r}")->getBorders()->applyFromArray([
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['argb' => 'FFE5E7EB'],
                            ],
                        ]);

                        $sheet->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("B{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle("C{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("D{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("E{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("F{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("G{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                        // Resaltado de stock crítico (<= 3)
                        $stockVal = (int) $sheet->getCell("E{$r}")->getValue();
                        if ($stockVal <= 3) {
                            $sheet->getStyle("E{$r}")->applyFromArray([
                                'font' => [
                                    'bold' => true,
                                    'color' => ['argb' => 'FFB91C1C'],
                                ],
                            ]);
                        }
                    }

                    // 6. Fila separadora y Fila de Totales con Subtotales Dinámicos
                    $blankRow = $highestRow + 1;
                    $sheet->getRowDimension($blankRow)->setRowHeight(12);

                    $summaryRow = $highestRow + 2;
                    $sheet->getRowDimension($summaryRow)->setRowHeight(26);

                    // Sin mergeCells para no romper ordenamientos ni filtros
                    $sheet->setCellValue("A{$summaryRow}", 'TOTALES Y PROMEDIOS');
                    $sheet->setCellValue("D{$summaryRow}", "=SUBTOTAL(101, D6:D{$highestRow})");
                    $sheet->setCellValue("E{$summaryRow}", "=SUBTOTAL(109, E6:E{$highestRow})");
                    $sheet->setCellValue("F{$summaryRow}", '="Total: " & SUBTOTAL(103, B6:B' . $highestRow . ') & " accesorios"');
                    $sheet->setCellValue("G{$summaryRow}", '');

                    $sheet->getStyle("D{$summaryRow}")->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle("E{$summaryRow}")->getNumberFormat()->setFormatCode('#,##0');

                    $sheet->getStyle("A{$summaryRow}:G{$summaryRow}")->applyFromArray([
                        'font' => [
                            'name' => 'Segoe UI',
                            'bold' => true,
                            'size' => 10,
                            'color' => ['argb' => 'FF1E3A2F'],
                        ],
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['argb' => 'FFE8EFEA'],
                        ],
                        'borders' => [
                            'top' => [
                                'borderStyle' => Border::BORDER_MEDIUM,
                                'color' => ['argb' => 'FF1E3A2F'],
                            ],
                            'bottom' => [
                                'borderStyle' => Border::BORDER_DOUBLE,
                                'color' => ['argb' => 'FF1E3A2F'],
                            ],
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['argb' => 'FFCBD5E1'],
                            ],
                        ],
                        'alignment' => [
                            'vertical' => Alignment::VERTICAL_CENTER,
                        ],
                    ]);

                    $sheet->getStyle("A{$summaryRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                    $sheet->getStyle("D{$summaryRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("E{$summaryRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("F{$summaryRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                    // Autofiltros en el rango de cabecera y datos
                    $sheet->setAutoFilter("A5:G{$highestRow}");
                } else {
                    $sheet->mergeCells('A6:G6');
                    $sheet->setCellValue('A6', 'No se encontraron accesorios para los filtros aplicados.');
                    $sheet->getStyle('A6:G6')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getRowDimension(6)->setRowHeight(24);
                }

                // 7. Congelar Paneles (Rows 1-5 fijos)
                $sheet->freezePane('A6');
            },
        ];
    }
}
