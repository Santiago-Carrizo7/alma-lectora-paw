const PRODUCT_TYPE_LABELS: Record<string, string> = {
    BOOK: 'Libro',
    ACCESSORY: 'Accesorio',
    COMBO: 'Combo',
};

/**
 * Spanish, user-facing label for the internal product type codes (BOOK, ACCESSORY, COMBO).
 */
export function productTypeLabel(type: string | null | undefined): string {
    return PRODUCT_TYPE_LABELS[(type ?? '').trim().toUpperCase()] ?? 'Producto';
}
