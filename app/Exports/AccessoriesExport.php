<?php

namespace App\Exports;

use App\Models\Accessory;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class AccessoriesExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
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
            ? Accessory::onlyTrashed()
            : Accessory::withoutTrashed();

        return $query->filter([
            'search' => $this->filters['search'] ?? null,
            'category' => $this->filters['category'] ?? null,
        ])->latest();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Título',
            'Categoría',
            'Precio ($)',
            'Stock',
            'Estado',
            'Descripción',
        ];
    }

    public function map($accessory): array
    {
        $status = $accessory->trashed() ? 'Archivado' : ($accessory->is_active ? 'Activo' : 'Inactivo');

        return [
            $accessory->id,
            $accessory->title,
            $accessory->category ?: 'General',
            number_format($accessory->price, 2, ',', '.'),
            $accessory->stock,
            $status,
            $accessory->description ?: '-',
        ];
    }
}
