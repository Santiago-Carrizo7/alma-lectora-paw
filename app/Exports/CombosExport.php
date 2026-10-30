<?php

namespace App\Exports;

use App\Models\Combo;
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

class CombosExport implements
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
            ? Combo::onlyTrashed()->with(['books.book', 'accessories.accessory'])
            : Combo::withoutTrashed()->with(['books.book', 'accessories.accessory']);

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $like = $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $like) {
                $q->where('title', $like, "%{$search}%")
                  ->orWhere('description', $like, "%{$search}%");
            });
        }

        return $query->latest();
    }

    public function startCell(): string
    {
        return 'A5';
    }

    public function title(): string
    {
        return 'Catálogo de Combos';
    }

    public function headings(): array
    {
        return [
            'ID',
            'Título del Combo',
            'Libros Incluidos',
            'Accesorios Incluidos',
            'Precio Unitario ($)',
            'Stock Disponible',
            'Estado',
            'Descripción',
        ];
    }

    public function map($combo): array
    {
        $books = $combo->books->map(function ($b) {
            $title = $b->book?->title ?? 'Libro';
            return $b->quantity > 1 ? "{$title} (x{$b->quantity})" : $title;
        })->implode(', ');

        $accessories = $combo->accessories->map(function ($a) {
            $title = $a->accessory?->title ?? 'Accesorio';
            return $a->quantity > 1 ? "{$title} (x{$a->quantity})" : $title;
        })->implode(', ');

        $status = $combo->trashed() ? 'Archivado' : ($combo->is_active ? 'Activo' : 'Inactivo');

        return [
            $combo->id,
            $combo->title,
            $books ?: 'Sin libros asignados',
            $accessories ?: 'Sin accesorios asignados',
            (float) $combo->price,
            (int) $combo->stock,
            $status,
            $combo->description ?: '-',
        ];
    }

    public function columnFormats(): array
    {
        return [
            'E' => '"$"#,##0.00',
            'F' => '#,##0',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $highestRow = $sheet->getHighestRow();
                $tab = $this->filters['tab'] ?? 'available';
                $tabLabel = $tab === 'archived' ? 'Combos Archivados' : 'Catálogo Activo';
                $search = !empty($this->filters['search']) ? $this->filters['search'] : 'Todos';
                $userName = auth()->user()?->name ?? 'Administración';
                $generatedAt = now()->format('d/m/Y H:i:s');

                // 1. Banner Institucional Principal (A1:H1)
                $sheet->mergeCells('A1:H1');
                $sheet->setCellValue('A1', 'ALMA LECTORA  |  CATÁLOGO GENERAL DE COMBOS');
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

                // 2. Metadatos y Filtros (A2:H2)
                $sheet->mergeCells('A2:H2');
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

                // 3. Fila separadora (A3:H3, A4:H4)
                $sheet->getRowDimension(3)->setRowHeight(8);
                $sheet->getRowDimension(4)->setRowHeight(8);

                // 4. Encabezados de Tabla (A5:H5)
                $sheet->getRowDimension(5)->setRowHeight(28);
                $sheet->getStyle('A5:H5')->applyFromArray([
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
                            $sheet->getStyle("A{$r}:H{$r}")->getFill()->applyFromArray([
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['argb' => 'FFF9FAF8'],
                            ]);
                        }

                        $sheet->getStyle("A{$r}:H{$r}")->getBorders()->applyFromArray([
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['argb' => 'FFE5E7EB'],
                            ],
                        ]);

                        $sheet->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("B{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle("C{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle("D{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle("E{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("F{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("G{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("H{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                        // Resaltado de stock crítico (<= 3)
                        $stockVal = (int) $sheet->getCell("F{$r}")->getValue();
                        if ($stockVal <= 3) {
                            $sheet->getStyle("F{$r}")->applyFromArray([
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
                    $sheet->setCellValue("E{$summaryRow}", "=SUBTOTAL(101, E6:E{$highestRow})");
                    $sheet->setCellValue("F{$summaryRow}", "=SUBTOTAL(109, F6:F{$highestRow})");
                    $sheet->setCellValue("G{$summaryRow}", '="Total: " & SUBTOTAL(103, B6:B' . $highestRow . ') & " combos"');
                    $sheet->setCellValue("H{$summaryRow}", '');

                    $sheet->getStyle("E{$summaryRow}")->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle("F{$summaryRow}")->getNumberFormat()->setFormatCode('#,##0');

                    $sheet->getStyle("A{$summaryRow}:H{$summaryRow}")->applyFromArray([
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
                    $sheet->getStyle("E{$summaryRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("F{$summaryRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("G{$summaryRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                    // Autofiltros en el rango de cabecera y datos
                    $sheet->setAutoFilter("A5:H{$highestRow}");
                } else {
                    $sheet->mergeCells('A6:H6');
                    $sheet->setCellValue('A6', 'No se encontraron combos para los filtros aplicados.');
                    $sheet->getStyle('A6:H6')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getRowDimension(6)->setRowHeight(24);
                }

                // 7. Congelar Paneles (Rows 1-5 fijos)
                $sheet->freezePane('A6');
            },
        ];
    }
}
