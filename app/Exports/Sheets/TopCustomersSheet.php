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

class TopCustomersSheet implements
    FromArray,
    WithHeadings,
    WithTitle,
    ShouldAutoSize,
    WithCustomStartCell,
    WithEvents
{
    protected array $customers;

    public function __construct(array $customers)
    {
        $this->customers = $customers;
    }

    public function title(): string
    {
        return 'Top Clientes';
    }

    public function startCell(): string
    {
        return 'A5';
    }

    public function headings(): array
    {
        return [
            'Posición',
            'Cliente',
            'Email',
            'DNI',
            'Teléfono',
            'Tipo de cuenta',
            'Compras',
            'Total gastado ($)',
            'Última compra',
        ];
    }

    public function array(): array
    {
        $rows = [];
        $i = 1;

        foreach ($this->customers as $c) {
            $rows[] = [
                $i++,
                $c['name'] ?? 'Cliente anónimo',
                $c['email'] ?? 'Sin correo',
                $c['dni'] ?? 'S/D',
                $c['phone'] ?? 'S/D',
                !empty($c['is_registered']) ? 'Cliente Registrado' : 'Comprador Invitado',
                (int) ($c['orders_count'] ?? 0),
                (float) ($c['total_spent'] ?? 0),
                $c['last_order_at'] ?? 'Sin fecha',
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
                $sheet->mergeCells('A1:I1');
                $sheet->setCellValue('A1', 'ALMA LECTORA  |  RANKING DE COMPRADORES DESTACADOS (TOP CLIENTES)');
                $sheet->getRowDimension(1)->setRowHeight(36);

                $sheet->getStyle('A1')->applyFromArray([
                    'font' => ['name' => 'Segoe UI', 'bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1E3A2F']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);

                // 2. Subtítulo
                $sheet->mergeCells('A2:I2');
                $now = now()->format('d/m/Y H:i:s');
                $sheet->setCellValue('A2', "Reporte generado el {$now} | Clientes que más compran");
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
                $sheet->getStyle('A5:I5')->applyFromArray([
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
                            $sheet->getStyle("A{$r}:I{$r}")->getFill()->applyFromArray([
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['argb' => 'FFF9FAF8'],
                            ]);
                        }

                        $sheet->getStyle("A{$r}:I{$r}")->getBorders()->applyFromArray([
                            'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFE5E7EB']],
                        ]);

                        $sheet->getStyle("A{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("B{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle("C{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
                        $sheet->getStyle("D{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("E{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("F{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        $sheet->getStyle("G{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("H{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                        $sheet->getStyle("I{$r}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                        $sheet->getStyle("G{$r}")->getNumberFormat()->setFormatCode('#,##0');
                        $sheet->getStyle("H{$r}")->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    }

                    // Fila de Totales con Fórmulas
                    $totRow = $highestRow + 1;
                    $sheet->getRowDimension($totRow)->setRowHeight(25);
                    $sheet->mergeCells("A{$totRow}:F{$totRow}");
                    $sheet->setCellValue("A{$totRow}", 'TOTALES TOP COMPRADORES');
                    $sheet->setCellValue("G{$totRow}", "=SUM(G6:G{$highestRow})");
                    $sheet->setCellValue("H{$totRow}", "=SUM(H6:H{$highestRow})");
                    $sheet->setCellValue("I{$totRow}", "=AVERAGE(H6:H{$highestRow})");

                    $sheet->getStyle("G{$totRow}")->getNumberFormat()->setFormatCode('#,##0');
                    $sheet->getStyle("H{$totRow}")->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle("I{$totRow}")->getNumberFormat()->setFormatCode('"Prom: $"#,##0.00');

                    $sheet->getStyle("A{$totRow}:I{$totRow}")->applyFromArray([
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
                    $sheet->getStyle("G{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("H{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle("I{$totRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                    $sheet->setAutoFilter("A5:I{$highestRow}");
                } else {
                    $sheet->mergeCells('A6:I6');
                    $sheet->setCellValue('A6', 'No se registran compras confirmadas en el período evaluado.');
                    $sheet->getStyle('A6:I6')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    $sheet->getRowDimension(6)->setRowHeight(24);
                }

                $sheet->freezePane('A6');
            },
        ];
    }
}
