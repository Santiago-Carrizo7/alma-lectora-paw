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

class CriticalStockSheet implements
    FromArray,
    WithHeadings,
    WithTitle,
    ShouldAutoSize,
    WithCustomStartCell,
    WithEvents
{
    protected array $criticalStock;

    public function __construct(array $criticalStock)
    {
        $this->criticalStock = $criticalStock;
    }

    public function title(): string
    {
        return 'Alerta Stock Crítico';
    }

    public function startCell(): string
    {
        return 'A5';
    }

    public function headings(): array
    {
        return [
            'Nivel de Riesgo',
            'ISBN',
            'Título del Libro',
            'Autores',
            'Precio ($)',
            'Stock Disponible',
            'Estado Operativo',
        ];
    }

    public function array(): array
    {
        $rows = [];

        foreach ($this->criticalStock as $book) {
            $stock = (int) ($book['stock'] ?? 0);
            $riesgo = $stock === 0 ? 'CRÍTICO: Agotado' : 'ALERTA: Reposición';

            $rows[] = [
                $riesgo,
                $book['isbn'] ?? 'S/D',
                $book['title'] ?? 'Sin título',
                $book['authors'] ?? 'Sin autor',
                (float) ($book['price'] ?? 0),
                $stock,
                $stock === 0 ? 'Sin existencias' : 'Últimas unidades',
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
                $sheet->mergeCells('A1:G1');
                $sheet->setCellValue('A1', 'ALMA LECTORA  |  ALERTAS DE INVENTARIO Y STOCK CRÍTICO');
                $sheet->getRowDimension(1)->setRowHeight(36);

                $sheet->getStyle('A1')->applyFromArray([
                    'font' => ['name' => 'Segoe UI', 'bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF991B1B']], // Rojo corporativo oscuro para alertas
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);

                // 2. Subtítulo
                $sheet->mergeCells('A2:G2');
                $now = now()->format('d/m/Y H:i:s');
                $sheet->setCellValue('A2', "Reporte generado el {$now} | Títulos con stock menor o igual a 3 unidades que requieren reposición prioritaria");
                $sheet->getRowDimension(2)->setRowHeight(20);

                $sheet->getStyle('A2')->applyFromArray([
                    'font' => ['name' => 'Segoe UI', 'italic' => true, 'size' => 9, 'color' => ['argb' => 'FF374151']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFEF2F2']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);

                $sheet->getRowDimension(3)->setRowHeight(8);
                $sheet->getRowDimension(4)->setRowHeight(8);

                // 3. Cabeceras
                $sheet->getRowDimension(5)->setRowHeight(26);
                $sheet->getStyle('A5:G5')->applyFromArray([
                    'font' => ['name' => 'Segoe UI', 'bold' => true, 'size' => 10, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFB91C1C']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'borders' => ['bottom' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF7F1D1D']]],
                ]);

                // 4. Filas de datos
                if ($highestRow >= 6) {
                    for ($r = 6; $r <= $highestRow; $r++) {
                        $sheet->getRowDimension($r)->setRowHeight(21);

                        if ($r % 2 === 0) {
                            $sheet->getStyle("A{$r}:G{$r}")->getFill()->applyFromArray([
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['argb' => 'FFFAFAFA'],
                            ]);
                        }

                        $sheet->getStyle("A{$r}:G{$r}")->getBorders()->applyFromArray([
                            'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFE5E7EB']],
                        ]);

                        $sheet->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("B{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("C{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle("D{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle("E{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("F{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("G{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                        $sheet->getStyle("E{$r}")->getNumberFormat()->setFormatCode('"$"#,##0.00');
                        $sheet->getStyle("F{$r}")->getNumberFormat()->setFormatCode('#,##0');

                        $stockVal = (int) $sheet->getCell("F{$r}")->getValue();
                        if ($stockVal === 0) {
                            $sheet->getStyle("A{$r}:G{$r}")->getFont()->setBold(true)->getColor()->setARGB('FFB91C1C');
                        }
                    }

                    // Fila de Totales con Fórmulas
                    $totRow = $highestRow + 1;
                    $sheet->getRowDimension($totRow)->setRowHeight(25);
                    $sheet->mergeCells("A{$totRow}:E{$totRow}");
                    $sheet->setCellValue("A{$totRow}", 'TOTAL DE LIBROS EN RIESGO DE STOCK');
                    $sheet->setCellValue("F{$totRow}", "=SUM(F6:F{$highestRow})");
                    $sheet->setCellValue("G{$totRow}", '="Total: " & COUNTA(C6:C' . $highestRow . ') & " títulos"');

                    $sheet->getStyle("F{$totRow}")->getNumberFormat()->setFormatCode('#,##0');

                    $sheet->getStyle("A{$totRow}:G{$totRow}")->applyFromArray([
                        'font' => ['name' => 'Segoe UI', 'bold' => true, 'size' => 10, 'color' => ['argb' => 'FF7F1D1D']],
                        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFEE2E2']],
                        'borders' => [
                            'top' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FFB91C1C']],
                            'bottom' => ['borderStyle' => Border::BORDER_DOUBLE, 'color' => ['argb' => 'FFB91C1C']],
                            'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFFCA5A5']],
                        ],
                        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                    ]);

                    $sheet->getStyle("A{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("F{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("G{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                    $sheet->setAutoFilter("A5:G{$highestRow}");
                } else {
                    $sheet->mergeCells('A6:G6');
                    $sheet->setCellValue('A6', 'Excelente: Todos los libros cuentan con stock saludable.');
                    $sheet->getStyle('A6:G6')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getRowDimension(6)->setRowHeight(24);
                }

                $sheet->freezePane('A6');
            },
        ];
    }
}
