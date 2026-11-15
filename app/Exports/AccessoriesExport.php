<?php

namespace App\Exports;

use App\Exports\Concerns\FormulaSafeValueBinder;
use App\Models\Accessory;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class AccessoriesExport extends DefaultValueBinder implements
    FromQuery,
    WithHeadings,
    WithMapping,
    ShouldAutoSize,
    WithCustomStartCell,
    WithColumnFormatting,
    WithEvents,
    WithTitle,
    WithCustomValueBinder
{
    use Exportable;
    use FormulaSafeValueBinder;

    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query(): Builder
    {
        $hasActiveFilters = !empty($this->filters['search'])
            || !empty($this->filters['category'])
            || !empty($this->filters['stock_status'])
            || !empty($this->filters['tab']);

        if (!$hasActiveFilters) {
            $query = Accessory::withTrashed()->with('category');
            if (!empty($this->filters['sort'])) {
                $query->filter(['sort' => $this->filters['sort']]);
            } else {
                $query->latest();
            }

            return $query;
        }

        $tab = $this->filters['tab'] ?? 'available';

        $query = $tab === 'archived'
            ? Accessory::onlyTrashed()->with('category')
            : Accessory::withoutTrashed()->with('category');

        $query->filter($this->filters);
        if (empty($this->filters['sort'])) {
            $query->latest();
        }

        return $query;
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
            (string) $accessory->id,
            $accessory->title,
            $accessory->category?->label ?? $accessory->category_label ?? 'General',
            (float) $accessory->price,
            (int) $accessory->stock,
            $status,
            trim(strip_tags((string) ($accessory->description ?: ''))) ?: '-',
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
                $hasActiveFilters = !empty($this->filters['search'])
                    || !empty($this->filters['category'])
                    || !empty($this->filters['stock_status'])
                    || !empty($this->filters['tab']);

                $tab = $this->filters['tab'] ?? 'available';
                $tabLabel = !$hasActiveFilters
                    ? 'Reporte Global (Disponibles + Archivados)'
                    : ($tab === 'archived' ? 'Accesorios Archivados' : 'Catálogo Activo');

                $search = !empty($this->filters['search']) ? $this->filters['search'] : 'Todos';
                $category = !empty($this->filters['category']) ? $this->filters['category'] : 'Todas';
                $stockLabel = match ($this->filters['stock_status'] ?? '') {
                    'in_stock' => 'Con stock (> 0)',
                    'low_stock' => 'Stock crítico (1 a 3)',
                    'out_of_stock' => 'Agotados (0)',
                    default => 'Todo',
                };
                $sortLabel = match ($this->filters['sort'] ?? '') {
                    'price_asc' => 'Precio (Menor a Mayor)',
                    'price_desc' => 'Precio (Mayor a Menor)',
                    'stock_asc' => 'Stock (Menor a Mayor)',
                    'stock_desc' => 'Stock (Mayor a Menor)',
                    'title_asc' => 'Título (A-Z)',
                    default => 'Más recientes',
                };
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
                $metaText = "Generado: {$generatedAt} | Usuario: {$userName} | Vista: {$tabLabel} | Búsqueda: \"{$search}\" | Categoría: {$category} | Stock: {$stockLabel} | Orden: {$sortLabel}";
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
                    $sheet->setCellValueExplicit("A{$summaryRow}", 'TOTAL DISPONIBLE EN INVENTARIO', DataType::TYPE_STRING);
                    $sheet->setCellValueExplicit("D{$summaryRow}", '', DataType::TYPE_STRING);
                    $sheet->setCellValueExplicit("E{$summaryRow}", "=SUBTOTAL(109, E6:E{$highestRow})", DataType::TYPE_FORMULA);
                    $sheet->setCellValueExplicit("F{$summaryRow}", '="Total: " & SUBTOTAL(103, B6:B' . $highestRow . ') & " accesorios"', DataType::TYPE_FORMULA);
                    $sheet->setCellValueExplicit("G{$summaryRow}", '', DataType::TYPE_STRING);

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
