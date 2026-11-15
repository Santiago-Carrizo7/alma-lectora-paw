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
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class CriticalStockSheet extends DefaultValueBinder implements
    FromArray,
    WithHeadings,
    WithTitle,
    ShouldAutoSize,
    WithCustomStartCell,
    WithEvents,
    WithCustomValueBinder
{
    use FormulaSafeValueBinder;

    protected array $criticalStock;
    protected string $periodLabel;
    protected string $generatedAt;
    protected string $generatedBy;

    public function __construct(
        array $criticalStock,
        string $periodLabel = 'Período seleccionado',
        string $generatedAt = '',
        string $generatedBy = 'Sistema Administrativo'
    ) {
        $this->criticalStock = $criticalStock;
        $this->periodLabel = $periodLabel;
        $this->generatedAt = $generatedAt ?: now()->format('d/m/Y H:i:s');
        $this->generatedBy = $generatedBy;
    }

    public function title(): string
    {
        return 'Alertas de Stock';
    }

    public function startCell(): string
    {
        return 'A5';
    }

    public function headings(): array
    {
        return [
            'Alerta',
            'ISBN',
            'Título del Libro',
            'Autores',
            'Precio ($)',
            'Stock',
            'Estado',
        ];
    }

    public function array(): array
    {
        $rows = [];

        foreach ($this->criticalStock as $book) {
            $stock = (int) ($book['stock'] ?? 0);
            $riesgo = $stock === 0 ? 'Agotado' : 'Poco stock';

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
                $sheet->setCellValue('A1', 'ALMA LECTORA  |  ALERTAS DE STOCK');
                $sheet->getRowDimension(1)->setRowHeight(36);

                $sheet->getStyle('A1')->applyFromArray([
                    'font' => ['name' => 'Segoe UI', 'bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF991B1B']], // Rojo corporativo oscuro para alertas
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);

                // 2. Subtítulo
                $sheet->mergeCells('A2:G2');
                $sheet->setCellValue('A2', "Período del informe: {$this->periodLabel} | Snapshot inventario emitido: {$this->generatedAt} | Por: {$this->generatedBy}");
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

                    // Fila separadora y Fila de Totales con Subtotales Dinámicos
                    // Insertamos fila en blanco para aislar el rango del AutoFilter y evitar errores al ordenar
                    $blankRow = $highestRow + 1;
                    $sheet->getRowDimension($blankRow)->setRowHeight(12);

                    $totRow = $highestRow + 2;
                    $sheet->getRowDimension($totRow)->setRowHeight(25);

                    // Sin mergeCells para no romper el motor de ordenamiento ni cálculos de Excel
                    $sheet->setCellValueExplicit("A{$totRow}", 'TOTAL LIBROS CON POCO STOCK O AGOTADOS', DataType::TYPE_STRING);
                    $sheet->setCellValueExplicit("F{$totRow}", "=SUBTOTAL(109, F6:F{$highestRow})", DataType::TYPE_FORMULA);
                    $sheet->setCellValueExplicit("G{$totRow}", '="Total: " & SUBTOTAL(103, C6:C' . $highestRow . ') & " títulos"', DataType::TYPE_FORMULA);

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

                    $sheet->getStyle("A{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
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
