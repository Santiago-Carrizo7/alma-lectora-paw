<?php

use App\Http\Controllers\AccessoryController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\ComboController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderLeadController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\AdminAccessoryController;
use App\Http\Controllers\Admin\AdminBookController;
use App\Http\Controllers\Admin\AdminComboController;
use App\Http\Controllers\Admin\AdminConfigController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminOrderController;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/libros', [BookController::class, 'index'])->name('books.index');
Route::get('/libros/{book}', [BookController::class, 'show'])->name('books.show');

Route::get('/accesorios', [AccessoryController::class, 'index'])->name('accessories.index');
Route::get('/accesorios/{accessory}', [AccessoryController::class, 'show'])->name('accessories.show');

Route::get('/combos/{combo}', [ComboController::class, 'show'])->name('combos.show');

Route::get('/checkout', [OrderLeadController::class, 'create'])->name('checkout.index');
Route::post('/pedidos/lead', [OrderLeadController::class, 'store'])->name('orders.lead.store');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::prefix('admin')->middleware(['auth', 'admin'])->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Libros
    Route::prefix('libros')->name('books.')->group(function () {
        Route::get('/', [AdminBookController::class, 'index'])->name('index');
        Route::get('/nuevo', [AdminBookController::class, 'create'])->name('create');
        Route::post('/', [AdminBookController::class, 'store'])->name('store');
        Route::get('/{book}/editar', [AdminBookController::class, 'edit'])->name('edit');
        Route::put('/{book}', [AdminBookController::class, 'update'])->name('update');
        Route::patch('/{book}/toggle-active', [AdminBookController::class, 'toggleActive'])->name('toggle-active');
        Route::patch('/{book}/stock', [AdminBookController::class, 'updateStock'])->name('update-stock');
        Route::delete('/{book}', [AdminBookController::class, 'destroy'])->name('destroy');
        Route::patch('/{id}/restaurar', [AdminBookController::class, 'restore'])->name('restore');
        Route::delete('/{id}/forzar', [AdminBookController::class, 'forceDestroy'])->name('force-destroy');
    });

    // Accesorios
    Route::prefix('accesorios')->name('accessories.')->group(function () {
        Route::get('/', [AdminAccessoryController::class, 'index'])->name('index');
        Route::get('/nuevo', [AdminAccessoryController::class, 'create'])->name('create');
        Route::post('/', [AdminAccessoryController::class, 'store'])->name('store');
        Route::get('/{accessory}/editar', [AdminAccessoryController::class, 'edit'])->name('edit');
        Route::put('/{accessory}', [AdminAccessoryController::class, 'update'])->name('update');
        Route::patch('/{accessory}/toggle-active', [AdminAccessoryController::class, 'toggleActive'])->name('toggle-active');
        Route::patch('/{accessory}/stock', [AdminAccessoryController::class, 'updateStock'])->name('update-stock');
        Route::delete('/{accessory}', [AdminAccessoryController::class, 'destroy'])->name('destroy');
        Route::patch('/{id}/restaurar', [AdminAccessoryController::class, 'restore'])->name('restore');
        Route::delete('/{id}/forzar', [AdminAccessoryController::class, 'forceDestroy'])->name('force-destroy');
    });

    // Combos
    Route::prefix('combos')->name('combos.')->group(function () {
        Route::get('/', [AdminComboController::class, 'index'])->name('index');
        Route::get('/nuevo', [AdminComboController::class, 'create'])->name('create');
        Route::post('/', [AdminComboController::class, 'store'])->name('store');
        Route::get('/{combo}/editar', [AdminComboController::class, 'edit'])->name('edit');
        Route::put('/{combo}', [AdminComboController::class, 'update'])->name('update');
        Route::patch('/{combo}/toggle-active', [AdminComboController::class, 'toggleActive'])->name('toggle-active');
        Route::patch('/{combo}/stock', [AdminComboController::class, 'updateStock'])->name('update-stock');
        Route::delete('/{combo}', [AdminComboController::class, 'destroy'])->name('destroy');
        Route::patch('/{id}/restaurar', [AdminComboController::class, 'restore'])->name('restore');
        Route::delete('/{id}/forzar', [AdminComboController::class, 'forceDestroy'])->name('force-destroy');
    });

    // Pedidos
    Route::prefix('pedidos')->name('orders.')->group(function () {
        Route::get('/', [AdminOrderController::class, 'index'])->name('index');
        Route::patch('/{order}/estado', [AdminOrderController::class, 'updateStatus'])->name('update-status');
        Route::delete('/{order}', [AdminOrderController::class, 'destroy'])->name('destroy');
    });

    // Configuración
    Route::prefix('configuracion')->name('config.')->group(function () {
        Route::get('/', [AdminConfigController::class, 'index'])->name('index');
        Route::put('/tienda', [AdminConfigController::class, 'updateStoreConfig'])->name('store-update');
        Route::post('/categorias', [AdminConfigController::class, 'storeCategory'])->name('category-store');
        Route::delete('/categorias/{category}', [AdminConfigController::class, 'destroyCategory'])->name('category-destroy');
        Route::put('/generos', [AdminConfigController::class, 'updateGenre'])->name('genre-update');
        Route::delete('/generos', [AdminConfigController::class, 'destroyGenre'])->name('genre-destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
