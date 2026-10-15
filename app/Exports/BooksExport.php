<?php

namespace App\Exports;

use App\Models\Book;
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
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class BooksExport implements
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
            ? Book::onlyTrashed()->with('authors')
            : Book::withoutTrashed()->with('authors');

        if (!empty($this->filters['search'])) {
            $query->filter(['search' => $this->filters['search']]);
        }

        return $query->latest();
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
                $tab = $this->filters['tab'] ?? 'available';
                $tabLabel = $tab === 'archived' ? 'Libros Archivados' : 'Catálogo Activo';
                $search = !empty($this->filters['search']) ? $this->filters['search'] : 'Todos';
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

                // 2. Metadatos de Auditoría y Filtros (A2:H2)
                $sheet->mergeCells('A2:H2');
                $metaText = "Generado: {$generatedAt} | Operador: {$userName} | Vista: {$tabLabel} | Filtro Búsqueda: \"{$search}\"";
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

                    // 6. Fila de Totales y Fórmulas Vivas de Excel
                    $summaryRow = $highestRow + 1;
                    $sheet->getRowDimension($summaryRow)->setRowHeight(26);

                    $sheet->mergeCells("A{$summaryRow}:D{$summaryRow}");
                    $sheet->setCellValue("A{$summaryRow}", 'TOTALES Y PROMEDIOS');
                    $sheet->setCellValue("E{$summaryRow}", "=AVERAGE(E6:E{$highestRow})");
                    $sheet->setCellValue("F{$summaryRow}", "=SUM(F6:F{$highestRow})");
                    $sheet->setCellValue("G{$summaryRow}", '="Total: " & COUNTA(B6:B' . $highestRow . ') & " títulos"');
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

                    $sheet->getStyle("A{$summaryRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
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
