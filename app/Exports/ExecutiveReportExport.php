<?php

namespace App\Exports;

use App\Exports\Sheets\BooksPerformanceSheet;
use App\Exports\Sheets\CriticalStockSheet;
use App\Exports\Sheets\ExecutiveSummarySheet;
use App\Exports\Sheets\TopCustomersSheet;
use Maatwebsite\Excel\Concerns\Export;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ExecutiveReportExport implements WithMultipleSheets, Export
{
    use Exportable;

    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function sheets(): array
    {
        $periodLabel = (string) ($this->data['period_label'] ?? 'Período seleccionado');
        $generatedAt = (string) ($this->data['generated_at'] ?? now()->format('d/m/Y H:i:s'));
        $generatedBy = (string) ($this->data['generated_by'] ?? 'Sistema Administrativo');

        return [
            new ExecutiveSummarySheet($this->data['kpis'] ?? [], $periodLabel, $generatedAt, $generatedBy),
            new TopCustomersSheet($this->data['top_customers'] ?? [], $periodLabel, $generatedAt, $generatedBy),
            new BooksPerformanceSheet(
                $this->data['best_selling_books'] ?? [],
                $this->data['least_selling_books'] ?? [],
                $this->data['no_sales_books'] ?? [],
                $periodLabel,
                $generatedAt,
                $generatedBy
            ),
            new CriticalStockSheet($this->data['critical_stock'] ?? [], $periodLabel, $generatedAt, $generatedBy),
        ];
    }
}
