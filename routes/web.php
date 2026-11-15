<?php

use App\Http\Controllers\AccessoryController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\ComboController;
use App\Http\Controllers\CustomerOrderController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderLeadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\AdminAccessoryController;
use App\Http\Controllers\Admin\AdminBookController;
use App\Http\Controllers\Admin\AdminComboController;
use App\Http\Controllers\Admin\AdminConfigController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminMediaController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminPermissionController;
use App\Http\Controllers\Admin\AdminReportController;
use App\Http\Controllers\Admin\AdminRoleController;
use App\Http\Controllers\Admin\AdminUserController;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/libros', [BookController::class, 'index'])->name('books.index');
Route::get('/libros/{book}', [BookController::class, 'show'])->name('books.show');

Route::get('/accesorios', [AccessoryController::class, 'index'])->name('accessories.index');
Route::get('/accesorios/{accessory}', [AccessoryController::class, 'show'])->name('accessories.show');

Route::get('/combos/{combo}', [ComboController::class, 'show'])->name('combos.show');

Route::get('/checkout', [OrderLeadController::class, 'create'])->name('checkout.index');
Route::post('/carrito/verificar-stock', [OrderLeadController::class, 'verifyStock'])->name('cart.verify-stock');
Route::post('/pedidos/lead', [OrderLeadController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('orders.lead.store');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Portal de Compras del Cliente
    Route::get('/mis-compras', [CustomerOrderController::class, 'index'])->name('customer.orders.index');
    Route::get('/mis-compras/{order}/remito', [CustomerOrderController::class, 'remito'])->name('customer.orders.remito');
});

Route::prefix('admin')->middleware(['auth', 'admin'])->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::post('/upload-image', [AdminMediaController::class, 'upload'])
        ->middleware('permission:crear libros|editar libros|crear accesorios|editar accesorios|crear combos|editar combos')
        ->name('upload-image');
    Route::delete('/upload-image', [AdminMediaController::class, 'destroy'])
        ->middleware('permission:crear libros|editar libros|crear accesorios|editar accesorios|crear combos|editar combos')
        ->name('upload-image.destroy');

    // Libros
    Route::prefix('libros')->name('books.')->group(function () {
        Route::get('/', [AdminBookController::class, 'index'])->middleware('permission:listar libros')->name('index');
        Route::get('/export', [AdminBookController::class, 'export'])->middleware('permission:exportar libros')->name('export');
        Route::get('/nuevo', [AdminBookController::class, 'create'])->middleware('permission:crear libros')->name('create');
        Route::post('/', [AdminBookController::class, 'store'])->middleware('permission:crear libros')->name('store');
        Route::get('/{book}/editar', [AdminBookController::class, 'edit'])->middleware('permission:editar libros')->name('edit');
        Route::put('/{book}', [AdminBookController::class, 'update'])->middleware('permission:editar libros')->name('update');
        Route::patch('/{book}/toggle-active', [AdminBookController::class, 'toggleActive'])->middleware('permission:editar libros')->name('toggle-active');
        Route::patch('/{book}/stock', [AdminBookController::class, 'updateStock'])->middleware('permission:editar libros')->name('update-stock');
        Route::delete('/{book}', [AdminBookController::class, 'destroy'])->middleware('permission:eliminar libros')->name('destroy');
        Route::patch('/{id}/restaurar', [AdminBookController::class, 'restore'])->middleware('permission:eliminar libros')->name('restore');
        Route::delete('/{id}/forzar', [AdminBookController::class, 'forceDestroy'])->middleware('permission:eliminar libros')->name('force-destroy');
    });

    // Accesorios
    Route::prefix('accesorios')->name('accessories.')->group(function () {
        Route::get('/', [AdminAccessoryController::class, 'index'])->middleware('permission:listar accesorios')->name('index');
        Route::get('/export', [AdminAccessoryController::class, 'export'])->middleware('permission:exportar accesorios')->name('export');
        Route::get('/nuevo', [AdminAccessoryController::class, 'create'])->middleware('permission:crear accesorios')->name('create');
        Route::post('/', [AdminAccessoryController::class, 'store'])->middleware('permission:crear accesorios')->name('store');
        Route::get('/{accessory}/editar', [AdminAccessoryController::class, 'edit'])->middleware('permission:editar accesorios')->name('edit');
        Route::put('/{accessory}', [AdminAccessoryController::class, 'update'])->middleware('permission:editar accesorios')->name('update');
        Route::patch('/{accessory}/toggle-active', [AdminAccessoryController::class, 'toggleActive'])->middleware('permission:editar accesorios')->name('toggle-active');
        Route::patch('/{accessory}/stock', [AdminAccessoryController::class, 'updateStock'])->middleware('permission:editar accesorios')->name('update-stock');
        Route::delete('/{accessory}', [AdminAccessoryController::class, 'destroy'])->middleware('permission:eliminar accesorios')->name('destroy');
        Route::patch('/{id}/restaurar', [AdminAccessoryController::class, 'restore'])->middleware('permission:eliminar accesorios')->name('restore');
        Route::delete('/{id}/forzar', [AdminAccessoryController::class, 'forceDestroy'])->middleware('permission:eliminar accesorios')->name('force-destroy');
    });

    // Combos
    Route::prefix('combos')->name('combos.')->group(function () {
        Route::get('/', [AdminComboController::class, 'index'])->middleware('permission:listar combos')->name('index');
        Route::get('/export', [AdminComboController::class, 'export'])->middleware('permission:exportar combos')->name('export');
        Route::get('/nuevo', [AdminComboController::class, 'create'])->middleware('permission:crear combos')->name('create');
        Route::post('/', [AdminComboController::class, 'store'])->middleware('permission:crear combos')->name('store');
        Route::get('/{combo}/editar', [AdminComboController::class, 'edit'])->middleware('permission:editar combos')->name('edit');
        Route::put('/{combo}', [AdminComboController::class, 'update'])->middleware('permission:editar combos')->name('update');
        Route::patch('/{combo}/toggle-active', [AdminComboController::class, 'toggleActive'])->middleware('permission:editar combos')->name('toggle-active');
        Route::patch('/{combo}/stock', [AdminComboController::class, 'updateStock'])->middleware('permission:editar combos')->name('update-stock');
        Route::delete('/{combo}', [AdminComboController::class, 'destroy'])->middleware('permission:eliminar combos')->name('destroy');
        Route::patch('/{id}/restaurar', [AdminComboController::class, 'restore'])->middleware('permission:eliminar combos')->name('restore');
        Route::delete('/{id}/forzar', [AdminComboController::class, 'forceDestroy'])->middleware('permission:eliminar combos')->name('force-destroy');
    });

    // Pedidos
    Route::prefix('pedidos')->name('orders.')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index'])->middleware('permission:listar pedidos')->name('index');
        Route::get('/{order}/remito', [AdminOrderController::class, 'remito'])->middleware('permission:descargar remitos')->name('remito');
        Route::patch('/{order}/estado', [AdminOrderController::class, 'updateStatus'])->middleware('permission:actualizar estado pedidos')->name('update-status');
        Route::delete('/{order}', [AdminOrderController::class, 'destroy'])->middleware('permission:eliminar pedidos')->name('destroy');
    });

    // Configuración
    Route::prefix('configuracion')->middleware('permission:gestionar configuracion tienda')->name('config.')->group(function () {
        Route::get('/', [AdminConfigController::class, 'index'])->name('index');
        Route::put('/tienda', [AdminConfigController::class, 'updateStoreConfig'])->name('store-update');
        Route::post('/categorias', [AdminConfigController::class, 'storeCategory'])->name('category-store');
        Route::delete('/categorias/{category}', [AdminConfigController::class, 'destroyCategory'])->name('category-destroy');
        Route::post('/generos', [AdminConfigController::class, 'storeGenre'])->name('genre-store');
        Route::put('/generos', [AdminConfigController::class, 'updateGenre'])->name('genre-update');
        Route::delete('/generos', [AdminConfigController::class, 'destroyGenre'])->name('genre-destroy');
    });

    // Reportes Gerenciales y Analítica
    Route::prefix('reportes')->name('reports.')->group(function () {
        Route::get('/', [AdminReportController::class, 'index'])->middleware('permission:ver reportes estadisticos')->name('index');
        Route::get('/pdf', [AdminReportController::class, 'pdf'])->middleware('permission:descargar reportes')->name('pdf');
        Route::get('/excel', [AdminReportController::class, 'excel'])->middleware('permission:descargar reportes')->name('excel');
    });

    // Gestión de Usuarios, Roles y Permisos (Exclusivo Super-Admin)
    Route::middleware(['role:super-admin'])->group(function () {
        Route::resource('usuarios', AdminUserController::class)->parameters(['usuarios' => 'user'])->names('users');
        Route::resource('roles', AdminRoleController::class)->parameters(['roles' => 'role'])->names('roles');
        Route::resource('permisos', AdminPermissionController::class)->parameters(['permisos' => 'permission'])->except(['create', 'show', 'edit'])->names('permissions');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
