<?php

namespace App\Exports\Concerns;

use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;

trait FormulaSafeValueBinder
{
    /**
     * Force every string cell from model/array rows to TYPE_STRING so leading '=', '+', '-', '@'
     * cannot trigger spreadsheet formula injection (H-15), while preserving numeric ints/floats.
     */
    public function bindValue(Cell $cell, mixed $value): bool
    {
        if (is_string($value)) {
            $cell->setValueExplicit($value, DataType::TYPE_STRING);

            return true;
        }

        return parent::bindValue($cell, $value);
    }
}
