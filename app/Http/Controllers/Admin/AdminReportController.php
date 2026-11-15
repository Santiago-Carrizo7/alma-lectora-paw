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
     * Resolve start and end Carbon dates from request period or custom from/to bounds.
     *
     * @return array{0: string, 1: \Illuminate\Support\Carbon|null, 2: \Illuminate\Support\Carbon|null, 3: string|null, 4: string|null}
     */
    private function resolveDateRange(Request $request): array
    {
        $period = (string) $request->input('period', '30_days');

        if ($period === 'custom') {
            $validated = $request->validate([
                'from' => ['required', 'date'],
                'to' => ['required', 'date', 'after_or_equal:from'],
            ], [
                'from.required' => 'Indicá una fecha de inicio válida.',
                'from.date' => 'La fecha de inicio no tiene un formato válido.',
                'to.required' => 'Indicá una fecha de fin válida.',
                'to.date' => 'La fecha de fin no tiene un formato válido.',
                'to.after_or_equal' => 'La fecha "Hasta" debe ser igual o posterior a la fecha "Desde".',
            ]);

            $startDate = \Illuminate\Support\Carbon::parse($validated['from'])->startOfDay();
            $endDate = \Illuminate\Support\Carbon::parse($validated['to'])->endOfDay();

            return ['custom', $startDate, $endDate, $startDate->toDateString(), $endDate->toDateString()];
        }

        [$startDate, $endDate] = match ($period) {
            '7_days' => [now()->subDays(6)->startOfDay(), now()->endOfDay()],
            '30_days' => [now()->subDays(29)->startOfDay(), now()->endOfDay()],
            'current_month' => [now()->startOfMonth(), now()->endOfMonth()],
            'all' => [null, null],
            default => [now()->subDays(29)->startOfDay(), now()->endOfDay()],
        };

        $resolvedPeriod = in_array($period, ['7_days', '30_days', 'current_month', 'all'], true)
            ? $period
            : '30_days';

        return [$resolvedPeriod, $startDate, $endDate, null, null];
    }

    /**
     * Display the analytics and calculated reports dashboard.
     */
    public function index(Request $request): Response
    {
        [$period, $startDate, $endDate, $from, $to] = $this->resolveDateRange($request);

        $reportData = $this->reportService->getExecutiveReportData($startDate, $endDate, $period);

        return Inertia::render('Admin/Reports/Index', [
            'report' => $reportData,
            'currentPeriod' => $period,
            'customRange' => [
                'from' => $from ?? '',
                'to' => $to ?? '',
            ],
        ]);
    }

    /**
     * Stream or download the executive PDF report.
     */
    public function pdf(Request $request): HttpResponse
    {
        [$period, $startDate, $endDate] = $this->resolveDateRange($request);
        $reportData = $this->reportService->getExecutiveReportData($startDate, $endDate, $period);

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
        [$period, $startDate, $endDate] = $this->resolveDateRange($request);
        $reportData = $this->reportService->getExecutiveReportData($startDate, $endDate, $period);

        $date = now()->format('Ymd');

        return Excel::download(
            new ExecutiveReportExport($reportData),
            "reporte-rendimiento-almalectora-{$date}.xlsx"
        );
    }
}
