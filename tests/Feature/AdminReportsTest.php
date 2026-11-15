<?php

namespace Tests\Feature;

use App\Exports\BooksExport;
use App\Exports\ExecutiveReportExport;
use App\Models\Book;
use App\Models\OrderLead;
use App\Models\User;
use App\Services\ReportService;
use Database\Seeders\BookSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Database\Seeders\StoreConfigSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

class AdminReportsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->seed(BookSeeder::class);
        $this->seed(StoreConfigSeeder::class);
    }

    public function test_guest_is_redirected_from_reports()
    {
        $response = $this->get('/admin/reportes');
        $response->assertRedirect('/login');
    }

    public function test_client_role_is_forbidden_from_reports()
    {
        $client = User::where('email', 'cliente@almalectora.com')->first();
        $this->actingAs($client);

        $response = $this->get('/admin/reportes');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_reports_dashboard()
    {
        $admin = User::where('email', 'admin@almalectora.com')->first();
        $this->actingAs($admin);

        $response = $this->get('/admin/reportes');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Reports/Index')
            ->has('report.kpis')
            ->has('report.top_customers')
            ->has('report.best_selling_books')
        );
    }

    public function test_super_admin_can_access_reports_dashboard()
    {
        $superadmin = User::where('email', 'superadmin@almalectora.com')->first();
        $this->actingAs($superadmin);

        $response = $this->get('/admin/reportes');
        $response->assertStatus(200);
    }

    public function test_admin_can_stream_executive_pdf_report()
    {
        $admin = User::where('email', 'admin@almalectora.com')->first();
        $this->actingAs($admin);

        $response = $this->get('/admin/reportes/pdf');
        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_admin_can_download_executive_excel_report()
    {
        $admin = User::where('email', 'admin@almalectora.com')->first();
        $this->actingAs($admin);

        Excel::fake();

        $response = $this->get('/admin/reportes/excel');
        $response->assertStatus(200);

        $filename = 'reporte-rendimiento-almalectora-' . now()->format('Ymd') . '.xlsx';

        Excel::assertDownloaded($filename, function (ExecutiveReportExport $export) {
            $sheets = $export->sheets();
            return count($sheets) === 4;
        });
    }

    public function test_admin_can_download_books_styled_excel_export()
    {
        $admin = User::where('email', 'admin@almalectora.com')->first();
        $this->actingAs($admin);

        Excel::fake();

        $response = $this->get('/admin/libros/export');
        $response->assertStatus(200);

        Excel::assertDownloaded('catalogo-libros-alma-lectora.xlsx', function (BooksExport $export) {
            return $export->startCell() === 'A5';
        });
    }

    public function test_report_service_calculates_correct_kpis_and_rankings()
    {
        $book = Book::first();

        // Crear cliente de prueba
        $customer = User::factory()->create([
            'name' => 'Compradora Estrella',
            'email' => 'estrella@ejemplo.com',
            'dni' => '39888777',
        ]);

        // Crear pedido confirmado
        OrderLead::create([
            'user_id' => $customer->id,
            'customer_name' => $customer->name,
            'customer_email' => $customer->email,
            'customer_phone' => '+5493875112233',
            'customer_dni' => $customer->dni,
            'status' => 'CONFIRMED',
            'total_amount' => 45000.00,
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => $book->title,
                    'quantity' => 3,
                    'unit_price' => 15000.00,
                ],
            ],
        ]);

        // Crear pedido pendiente de WhatsApp
        OrderLead::create([
            'customer_name' => 'Interesado WA',
            'customer_email' => 'interesado@ejemplo.com',
            'customer_phone' => '+5493875998877',
            'customer_dni' => '38777666',
            'status' => 'PENDING_WHATSAPP',
            'total_amount' => 15000.00,
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => $book->title,
                    'quantity' => 1,
                    'unit_price' => 15000.00,
                ],
            ],
        ]);

        $service = app(ReportService::class);
        $kpis = $service->getSummaryKpis();

        $this->assertGreaterThanOrEqual(1, $kpis['confirmed_orders']);
        $this->assertGreaterThanOrEqual(45000.00, $kpis['total_revenue']);
        $this->assertGreaterThanOrEqual(3, $kpis['units_sold']);

        $top = $service->getTopCustomers(5);
        $this->assertTrue($top->contains('email', 'estrella@ejemplo.com'));

        $bestSelling = $service->getBestSellingBooks(5);
        $this->assertTrue($bestSelling->contains('id', $book->id));
    }

    public function test_custom_date_range_validates_inverted_dates_and_filters_reports()
    {
        $admin = User::where('email', 'admin@almalectora.com')->first();
        $this->actingAs($admin);

        // Rango invertido devuelve error de validación en 'to'
        $invalidResponse = $this->get('/admin/reportes?period=custom&from=2026-05-15&to=2026-05-10');
        $invalidResponse->assertSessionHasErrors(['to']);

        // Crear pedido dentro y fuera de rango personalizado
        $oldOrder = OrderLead::create([
            'customer_name' => 'Cliente Histórico',
            'customer_email' => 'hist@ejemplo.com',
            'customer_phone' => '+5493875000001',
            'customer_dni' => '30111222',
            'status' => 'CONFIRMED',
            'total_amount' => 12000.00,
            'items' => [['id' => Book::first()->id, 'type' => 'BOOK', 'title' => 'Libro Viejo', 'quantity' => 1, 'unit_price' => 12000]],
        ]);
        $oldOrder->created_at = now()->subDays(40);
        $oldOrder->updated_at = now()->subDays(40);
        $oldOrder->saveQuietly();

        OrderLead::create([
            'customer_name' => 'Cliente Reciente',
            'customer_email' => 'reciente@ejemplo.com',
            'customer_phone' => '+5493875000002',
            'customer_dni' => '30222333',
            'status' => 'CONFIRMED',
            'total_amount' => 25000.00,
            'items' => [['id' => Book::first()->id, 'type' => 'BOOK', 'title' => 'Libro Nuevo', 'quantity' => 2, 'unit_price' => 12500]],
        ]);

        $from = now()->subDays(2)->toDateString();
        $to = now()->toDateString();

        $validResponse = $this->get("/admin/reportes?period=custom&from={$from}&to={$to}");
        $validResponse->assertStatus(200);
        $validResponse->assertInertia(fn ($page) => $page
            ->where('currentPeriod', 'custom')
            ->where('customRange.from', $from)
            ->where('customRange.to', $to)
            ->where('report.kpis.confirmed_orders', 1)
            ->where('report.kpis.total_revenue', fn ($val) => (float) $val === 25000.0)
        );
    }

    public function test_executive_excel_prevents_formula_injection_and_exports_period_and_exact_kpis()
    {
        $book = Book::first();
        $admin = User::where('email', 'admin@almalectora.com')->first();
        $this->actingAs($admin);

        OrderLead::create([
            'customer_name' => '=SUM(1+1)',
            'customer_email' => 'inyeccion@ejemplo.com',
            'customer_phone' => '+5493875111222',
            'customer_dni' => '31000999',
            'status' => 'CONFIRMED',
            'total_amount' => 18000.00,
            'items' => [
                [
                    'id' => $book->id,
                    'type' => 'BOOK',
                    'title' => $book->title,
                    'quantity' => 2,
                    'unit_price' => 9000.00,
                ],
            ],
        ]);

        $service = app(ReportService::class);
        $reportData = $service->getExecutiveReportData(null, null, 'all');

        Storage::fake('local');
        $path = 'test-executive-report.xlsx';
        Excel::store(new ExecutiveReportExport($reportData), $path, 'local');

        $spreadsheet = IOFactory::load(Storage::disk('local')->path($path));
        $summarySheet = $spreadsheet->getSheet(0);
        $customersSheet = $spreadsheet->getSheet(1);

        // El período completo figura explícitamente en A2 y C6/C7/C8/C12 reflejan valores numéricos reales (no fórmulas sin calcular)
        $this->assertStringContainsString('Histórico completo', (string) $summarySheet->getCell('A2')->getValue());
        $this->assertEquals(18000.0, (float) $summarySheet->getCell('C6')->getValue());
        $this->assertEquals(18000.0, (float) $summarySheet->getCell('C7')->getValue());
        $this->assertEquals(1, (int) $summarySheet->getCell('C8')->getValue());
        $this->assertEquals(100.0, (float) $summarySheet->getCell('C12')->getValue());

        // El nombre malicioso '=SUM(1+1)' se almacena como texto literal (TYPE_STRING), no como fórmula
        $nameCell = $customersSheet->getCell('B6');
        $this->assertSame('=SUM(1+1)', $nameCell->getValue());
        $this->assertSame(DataType::TYPE_STRING, $nameCell->getDataType());
    }
}
