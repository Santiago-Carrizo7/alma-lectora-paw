export interface Author {
    id: string;
    name: string;
}

export interface Book {
    id: string;
    isbn: string;
    title: string;
    original_title?: string | null;
    originalTitle?: string | null;
    google_books_id?: string | null;
    published_date?: string | null;
    language?: string | null;
    synopsis?: string | null;
    cover_url?: string | null;
    coverUrl?: string | null;
    additional_images?: string[];
    price: string | number;
    promo_quantity?: number | null;
    promoQuantity?: number | null;
    promo_price?: string | number | null;
    promoPrice?: string | number | null;
    stock: number;
    badge?: string | null;
    genre?: string | null;
    is_active?: boolean;
    isActive?: boolean;
    authors: Author[];
    created_at?: string;
    updated_at?: string;
}

export interface CatalogFilters {
    search?: string;
    genre?: string;
    badge?: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface AccessoryCategory {
    id: string;
    slug: string;
    label: string;
    emoji?: string | null;
    order: number;
    is_active: boolean;
}

export interface Accessory {
    id: string;
    title: string;
    description?: string | null;
    price: string | number;
    promo_quantity?: number | null;
    promoQuantity?: number | null;
    promo_price?: string | number | null;
    promoPrice?: string | number | null;
    stock: number;
    category: string;
    cover_url?: string | null;
    coverUrl?: string | null;
    additional_images?: string[];
    is_active?: boolean;
    isActive?: boolean;
    created_at?: string;
    updated_at?: string;
}
