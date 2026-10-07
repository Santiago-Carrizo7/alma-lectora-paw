<?php

namespace App\Exports;

use App\Models\Combo;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CombosExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    use Exportable;

    protected array $filters;

    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query(): Builder
    {
        $tab = $this->filters['tab'] ?? 'available';

        $query = $tab === 'archived'
            ? Combo::onlyTrashed()->with(['books.book', 'accessories.accessory'])
            : Combo::withoutTrashed()->with(['books.book', 'accessories.accessory']);

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $like = $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function ($q) use ($search, $like) {
                $q->where('title', $like, "%{$search}%")
                  ->orWhere('description', $like, "%{$search}%");
            });
        }

        return $query->latest();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Título del Combo',
            'Libros Incluidos',
            'Accesorios Incluidos',
            'Precio ($)',
            'Stock',
            'Estado',
            'Descripción',
        ];
    }

    public function map($combo): array
    {
        $books = $combo->books->map(function ($b) {
            $title = $b->book?->title ?? 'Libro';
            return $b->quantity > 1 ? "{$title} (x{$b->quantity})" : $title;
        })->implode(', ');

        $accessories = $combo->accessories->map(function ($a) {
            $title = $a->accessory?->title ?? 'Accesorio';
            return $a->quantity > 1 ? "{$title} (x{$a->quantity})" : $title;
        })->implode(', ');

        $status = $combo->trashed() ? 'Archivado' : ($combo->is_active ? 'Activo' : 'Inactivo');

        return [
            $combo->id,
            $combo->title,
            $books ?: 'Sin libros asignados',
            $accessories ?: 'Sin accesorios asignados',
            number_format($combo->price, 2, ',', '.'),
            $combo->stock,
            $status,
            $combo->description ?: '-',
        ];
    }
}
