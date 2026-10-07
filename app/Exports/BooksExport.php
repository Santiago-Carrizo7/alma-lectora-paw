<?php

namespace App\Exports;

use App\Models\Book;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class BooksExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
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
            ? Book::onlyTrashed()->with('authors')
            : Book::withoutTrashed()->with('authors');

        if (!empty($this->filters['search'])) {
            $query->filter(['search' => $this->filters['search']]);
        }

        return $query->latest();
    }

    public function headings(): array
    {
        return [
            'ISBN',
            'Título',
            'Autores',
            'Género',
            'Precio ($)',
            'Stock',
            'Estado',
            'Destacado / Badge',
        ];
    }

    public function map($book): array
    {
        $authors = $book->authors->pluck('name')->implode(', ');
        $status = $book->trashed() ? 'Archivado' : ($book->is_active ? 'Activo' : 'Inactivo');

        return [
            $book->isbn,
            $book->title,
            $authors ?: 'Sin autor asignado',
            $book->genre ?: 'General',
            number_format($book->price, 2, ',', '.'),
            $book->stock,
            $status,
            $book->badge ?: '-',
        ];
    }
}
