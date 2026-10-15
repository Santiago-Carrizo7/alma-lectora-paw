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
        return [
            new ExecutiveSummarySheet($this->data['kpis'] ?? []),
            new TopCustomersSheet($this->data['top_customers'] ?? []),
            new BooksPerformanceSheet(
                $this->data['best_selling_books'] ?? [],
                $this->data['least_selling_books'] ?? [],
                $this->data['no_sales_books'] ?? []
            ),
            new CriticalStockSheet($this->data['critical_stock'] ?? []),
        ];
    }
}
