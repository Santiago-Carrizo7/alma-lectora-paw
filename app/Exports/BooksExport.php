<?php

namespace App\Exports;

use App\Exports\Concerns\FormulaSafeValueBinder;
use App\Models\Book;
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
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class BooksExport extends DefaultValueBinder implements
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
            || !empty($this->filters['genre'])
            || !empty($this->filters['stock_status'])
            || !empty($this->filters['tab']);

        if (!$hasActiveFilters) {
            $query = Book::withTrashed()->with('authors');
            if (!empty($this->filters['sort'])) {
                $query->filter(['sort' => $this->filters['sort']]);
            } else {
                $query->latest();
            }

            return $query;
        }

        $tab = $this->filters['tab'] ?? 'available';

        $query = $tab === 'archived'
            ? Book::onlyTrashed()->with('authors')
            : Book::withoutTrashed()->with('authors');

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
        return 'Catálogo Editorial';
    }

    public function headings(): array
    {
        return [
            'ISBN',
            'Título del Libro',
            'Autores',
            'Género',
            'Precio Unitario ($)',
            'Stock Disponible',
            'Estado',
            'Destacado / Badge',
        ];
    }

    public function map($book): array
    {
        $authors = $book->authors->pluck('name')->implode(', ');
        $status = $book->trashed() ? 'Archivado' : ($book->is_active ? 'Activo' : 'Inactivo');

        return [
            $book->isbn,
            $book->title,
            $authors ?: 'Sin autor asignado',
            $book->genre ?: 'General',
            (float) $book->price,
            (int) $book->stock,
            $status,
            $book->badge ?: '-',
        ];
    }

    public function columnFormats(): array
    {
        return [
            'A' => NumberFormat::FORMAT_TEXT,
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
                $hasActiveFilters = !empty($this->filters['search'])
                    || !empty($this->filters['genre'])
                    || !empty($this->filters['stock_status'])
                    || !empty($this->filters['tab']);

                $tab = $this->filters['tab'] ?? 'available';
                $tabLabel = !$hasActiveFilters
                    ? 'Reporte Global (Disponibles + Archivados)'
                    : ($tab === 'archived' ? 'Libros Archivados' : 'Catálogo Activo');

                $search = !empty($this->filters['search']) ? $this->filters['search'] : 'Todos';
                $genre = !empty($this->filters['genre']) ? $this->filters['genre'] : 'Todos';
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

                // 1. Banner Institucional Principal (A1:H1)
                $sheet->mergeCells('A1:H1');
                $sheet->setCellValue('A1', 'ALMA LECTORA  |  CATÁLOGO GENERAL DE LIBROS');
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
                        'startColor' => ['argb' => 'FF1E3A2F'], // Verde Bosque Corporativo
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER,
                    ],
                ]);

                // 2. Metadatos y Filtros (A2:H2)
                $sheet->mergeCells('A2:H2');
                $metaText = "Generado: {$generatedAt} | Usuario: {$userName} | Vista: {$tabLabel} | Búsqueda: \"{$search}\" | Género: {$genre} | Stock: {$stockLabel} | Orden: {$sortLabel}";
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

                // 3. Fila separadora (A3:H3)
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
                        'startColor' => ['argb' => 'FF2C4A3E'], // Tono medio verde editorial
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

                // 5. Formato de Filas de Datos (Row 6 hasta $highestRow)
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

                        // Bordes tenues
                        $sheet->getStyle("A{$r}:H{$r}")->getBorders()->applyFromArray([
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['argb' => 'FFE5E7EB'],
                            ],
                        ]);

                        // Alineaciones por columna
                        $sheet->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("B{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle("C{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle("D{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("E{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("F{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("G{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("H{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                        // Resaltado de stock crítico (<= 3)
                        $stockVal = (int) $sheet->getCell("F{$r}")->getValue();
                        if ($stockVal <= 3) {
                            $sheet->getStyle("F{$r}")->applyFromArray([
                                'font' => [
                                    'bold' => true,
                                    'color' => ['argb' => 'FFB91C1C'], // Rojo advertencia
                                ],
                            ]);
                        }
                    }

                    // 6. Fila separadora y Fila de Totales con Subtotales Dinámicos
                    // Insertamos una fila en blanco para aislar el rango del AutoFilter y evitar errores al ordenar
                    $blankRow = $highestRow + 1;
                    $sheet->getRowDimension($blankRow)->setRowHeight(12);

                    $summaryRow = $highestRow + 2;
                    $sheet->getRowDimension($summaryRow)->setRowHeight(26);

                    // Sin mergeCells para no romper el motor de ordenamiento ni cálculos de Excel
                    $sheet->setCellValueExplicit("A{$summaryRow}", 'TOTAL DISPONIBLE EN INVENTARIO', DataType::TYPE_STRING);
                    $sheet->setCellValueExplicit("E{$summaryRow}", '', DataType::TYPE_STRING);
                    $sheet->setCellValueExplicit("F{$summaryRow}", "=SUBTOTAL(109, F6:F{$highestRow})", DataType::TYPE_FORMULA);
                    $sheet->setCellValueExplicit("G{$summaryRow}", '="Total: " & SUBTOTAL(103, B6:B' . $highestRow . ') & " títulos"', DataType::TYPE_FORMULA);
                    $sheet->setCellValueExplicit("H{$summaryRow}", '', DataType::TYPE_STRING);

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
                    // Sin datos
                    $sheet->mergeCells('A6:H6');
                    $sheet->setCellValue('A6', 'No se encontraron libros para los filtros aplicados.');
                    $sheet->getStyle('A6:H6')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getRowDimension(6)->setRowHeight(24);
                }

                // 7. Congelar Paneles (Rows 1-5 fijos al desplazarse hacia abajo)
                $sheet->freezePane('A6');
            },
        ];
    }
}
