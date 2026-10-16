<?php

namespace App\Http\Controllers\Admin;

use App\Exports\ExecutiveReportExport;
use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Display the analytics and calculated reports dashboard.
     */
    public function index(Request $request): Response
    {
        $reportData = $this->reportService->getExecutiveReportData();

        return Inertia::render('Admin/Reports/Index', [
            'report' => $reportData,
        ]);
    }

    /**
     * Stream or download the executive PDF report.
     */
    public function pdf(Request $request): HttpResponse
    {
        $reportData = $this->reportService->getExecutiveReportData();

        $pdf = Pdf::loadView('pdf.executive-report', ['data' => $reportData])
            ->setPaper('a4', 'portrait');

        $date = now()->format('Ymd-His');

        return $pdf->stream("informe-rendimiento-almalectora-{$date}.pdf");
    }

    /**
     * Download multi-sheet Excel spreadsheet with dynamic formulas.
     */
    public function excel(Request $request): BinaryFileResponse
    {
        $reportData = $this->reportService->getExecutiveReportData();

        $date = now()->format('Ymd');

        return Excel::download(
            new ExecutiveReportExport($reportData),
            "reporte-rendimiento-almalectora-{$date}.xlsx"
        );
    }
}
