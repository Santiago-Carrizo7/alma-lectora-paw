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

class BooksPerformanceSheet implements
    FromArray,
    WithHeadings,
    WithTitle,
    ShouldAutoSize,
    WithCustomStartCell,
    WithEvents
{
    protected array $bestSelling;
    protected array $leastSelling;
    protected array $noSales;

    public function __construct(array $bestSelling, array $leastSelling, array $noSales)
    {
        $this->bestSelling = $bestSelling;
        $this->leastSelling = $leastSelling;
        $this->noSales = $noSales;
    }

    public function title(): string
    {
        return 'Rotación de Catálogo';
    }

    public function startCell(): string
    {
        return 'A5';
    }

    public function headings(): array
    {
        return [
            'Posición',
            'ISBN',
            'Título del Libro',
            'Autores',
            'Género',
            'Precio Unitario ($)',
            'Unidades Vendidas',
            'Facturación Generada ($)',
            'Stock en Bodega',
            'Nivel de Demanda',
        ];
    }

    public function array(): array
    {
        $rows = [];
        $rank = 1;

        // 1. Libros Más Vendidos
        foreach ($this->bestSelling as $book) {
            $rows[] = [
                'Top #' . $rank++,
                $book['isbn'] ?? 'S/D',
                $book['title'] ?? 'Sin título',
                $book['authors'] ?? 'Sin autor',
                $book['genre'] ?? 'General',
                (float) ($book['price'] ?? 0),
                (int) ($book['units_sold'] ?? 0),
                (float) ($book['total_revenue'] ?? 0),
                (int) ($book['stock'] ?? 0),
                'Alta Demanda',
            ];
        }

        // 2. Libros con Menor Rotación (> 0 ventas)
        foreach ($this->leastSelling as $book) {
            // Evitar duplicados si ya estaba en bestSelling
            $alreadyIncluded = collect($this->bestSelling)->contains('id', $book['id']);
            if ($alreadyIncluded) {
                continue;
            }

            $rows[] = [
                'Baja Rotación',
                $book['isbn'] ?? 'S/D',
                $book['title'] ?? 'Sin título',
                $book['authors'] ?? 'Sin autor',
                $book['genre'] ?? 'General',
                (float) ($book['price'] ?? 0),
                (int) ($book['units_sold'] ?? 0),
                (float) ($book['total_revenue'] ?? 0),
                (int) ($book['stock'] ?? 0),
                'Baja Demanda',
            ];
        }

        // 3. Libros Sin Ventas Registradas
        foreach (array_slice($this->noSales, 0, 15) as $book) {
            $rows[] = [
                'Sin Ventas',
                $book['isbn'] ?? 'S/D',
                $book['title'] ?? 'Sin título',
                $book['authors'] ?? 'Sin autor',
                $book['genre'] ?? 'General',
                (float) ($book['price'] ?? 0),
                0,
                0.0,
                (int) ($book['stock'] ?? 0),
                'Sin Movimiento',
            ];
        }

        return $rows;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highestRow = $sheet->getHighestRow();

                // 1. Banner
                $sheet->mergeCells('A1:J1');
                $sheet->setCellValue('A1', 'ALMA LECTORA  |  ANÁLISIS DE ROTACIÓN, VENTAS Y MOVIMIENTO DE LIBROS');
                $sheet->getRowDimension(1)->setRowHeight(36);

                $sheet->getStyle('A1')->applyFromArray([
                    'font' => ['name' => 'Segoe UI', 'bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1E3A2F']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);

                // 2. Subtítulo
                $sheet->mergeCells('A2:J2');
                $now = now()->format('d/m/Y H:i:s');
                $sheet->setCellValue('A2', "Reporte generado el {$now} | Métricas calculadas sobre ítems efectivamente confirmados");
                $sheet->getRowDimension(2)->setRowHeight(20);

                $sheet->getStyle('A2')->applyFromArray([
                    'font' => ['name' => 'Segoe UI', 'italic' => true, 'size' => 9, 'color' => ['argb' => 'FF374151']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFF1F5F2']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);

                $sheet->getRowDimension(3)->setRowHeight(8);
                $sheet->getRowDimension(4)->setRowHeight(8);

                // 3. Cabeceras
                $sheet->getRowDimension(5)->setRowHeight(26);
                $sheet->getStyle('A5:J5')->applyFromArray([
                    'font' => ['name' => 'Segoe UI', 'bold' => true, 'size' => 10, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2C4A3E']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'borders' => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF1E3A2F']]],
                ]);

                // 4. Filas de datos
                if ($highestRow >= 6) {
                    for ($r = 6; $r <= $highestRow; $r++) {
                        $sheet->getRowDimension($r)->setRowHeight(21);

                        if ($r % 2 === 0) {
                            $sheet->getStyle("A{$r}:J{$r}")->getFill()->applyFromArray([
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['argb' => 'FFF9FAF8'],
                            ]);
                        }

                        $sheet->getStyle("A{$r}:J{$r}")->getBorders()->applyFromArray([
                            'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFE5E7EB']],
                        ]);

                        $sheet->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("B{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("C{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle("D{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle("E{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("F{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("G{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("H{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("I{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("J{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                        $sheet->getStyle("F{$r}")->getNumberFormat()->setFormatCode('"$"#,##0.00');
                        $sheet->getStyle("G{$r}")->getNumberFormat()->setFormatCode('#,##0');
                        $sheet->getStyle("H{$r}")->getNumberFormat()->setFormatCode('"$"#,##0.00');
                        $sheet->getStyle("I{$r}")->getNumberFormat()->setFormatCode('#,##0');

                        // Resaltado por categoría
                        $categoria = (string) $sheet->getCell("J{$r}")->getValue();
                        if ($categoria === 'Alta Demanda') {
                            $sheet->getStyle("J{$r}")->getFont()->setBold(true)->getColor()->setARGB('FF15803D');
                        } elseif ($categoria === 'Sin Movimiento') {
                            $sheet->getStyle("J{$r}")->getFont()->setItalic(true)->getColor()->setARGB('FF64748B');
                        }
                    }

                    // Fila de Totales con Fórmulas de Excel
                    $totRow = $highestRow + 1;
                    $sheet->getRowDimension($totRow)->setRowHeight(25);
                    $sheet->mergeCells("A{$totRow}:E{$totRow}");
                    $sheet->setCellValue("A{$totRow}", 'TOTALES Y PROMEDIOS');
                    $sheet->setCellValue("F{$totRow}", "=AVERAGE(F6:F{$highestRow})");
                    $sheet->setCellValue("G{$totRow}", "=SUM(G6:G{$highestRow})");
                    $sheet->setCellValue("H{$totRow}", "=SUM(H6:H{$highestRow})");
                    $sheet->setCellValue("I{$totRow}", "=SUM(I6:I{$highestRow})");
                    $sheet->setCellValue("J{$totRow}", '');

                    $sheet->getStyle("F{$totRow}")->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle("G{$totRow}")->getNumberFormat()->setFormatCode('#,##0');
                    $sheet->getStyle("H{$totRow}")->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle("I{$totRow}")->getNumberFormat()->setFormatCode('#,##0');

                    $sheet->getStyle("A{$totRow}:J{$totRow}")->applyFromArray([
                        'font' => ['name' => 'Segoe UI', 'bold' => true, 'size' => 10, 'color' => ['argb' => 'FF1E3A2F']],
                        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE8EFEA']],
                        'borders' => [
                            'top' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF1E3A2F']],
                            'bottom' => ['borderStyle' => Border::BORDER_DOUBLE, 'color' => ['argb' => 'FF1E3A2F']],
                            'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFCBD5E1']],
                        ],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                    ]);

                    $sheet->getStyle("A{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("F{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("G{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("H{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("I{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                    $sheet->setAutoFilter("A5:J{$highestRow}");
                } else {
                    $sheet->mergeCells('A6:J6');
                    $sheet->setCellValue('A6', 'No hay datos de catálogo disponibles.');
                    $sheet->getStyle('A6:J6')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getRowDimension(6)->setRowHeight(24);
                }

                $sheet->freezePane('A6');
            },
        ];
    }
}
