<?php

use App\Http\Controllers\AccessoryController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\AdminBookController;
use App\Http\Controllers\Admin\AdminDashboardController;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/libros', [BookController::class, 'index'])->name('books.index');
Route::get('/libros/{book}', [BookController::class, 'show'])->name('books.show');

Route::get('/accesorios', [AccessoryController::class, 'index'])->name('accessories.index');
Route::get('/accesorios/{accessory}', [AccessoryController::class, 'show'])->name('accessories.show');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::prefix('admin')->middleware(['auth', 'admin'])->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
