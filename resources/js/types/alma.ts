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

export interface ComboBookRelation {
    combo_id?: string;
    book_id?: string;
    comboId?: string;
    bookId?: string;
    quantity: number;
    book?: Book;
}

export interface ComboAccessoryRelation {
    combo_id?: string;
    accessory_id?: string;
    comboId?: string;
    accessoryId?: string;
    quantity: number;
    accessory?: Accessory;
}

export interface Combo {
    id: string;
    title: string;
    description?: string | null;
    price: string | number;
    promo_quantity?: number | null;
    promoQuantity?: number | null;
    promo_price?: string | number | null;
    promoPrice?: string | number | null;
    cover_url?: string | null;
    coverUrl?: string | null;
    additional_images?: string[];
    additionalImages?: string[];
    stock: number;
    is_active?: boolean;
    isActive?: boolean;
    books?: ComboBookRelation[];
    accessories?: ComboAccessoryRelation[];
    created_at?: string;
    updated_at?: string;
}

export interface StoreConfig {
    id: string;
    whatsapp_phone: string;
    whatsappPhone?: string;
    instagram_url: string;
    instagramUrl?: string;
    shipping_cost: string | number;
    shippingCost?: string | number;
    free_shipping_min: string | number;
    freeShippingMin?: string | number;
    banner_message?: string | null;
    bannerMessage?: string | null;
    is_store_open: boolean;
    isStoreOpen?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ShippingFormData {
    postalCode: string;
    address: string;
}

export interface CustomerFormData {
    customerName: string;
    customerEmail: string;
    customerDni: string;
    customerPhone: string;
}

export interface OrderLead {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    customer_dni: string;
    postal_code?: string | null;
    address?: string | null;
    items: Array<{
        id: string;
        type: 'BOOK' | 'ACCESSORY' | 'COMBO';
        title: string;
        quantity: number;
        unit_price: number | string;
        cover_url?: string | null;
    }>;
    total_amount: number | string;
    status: 'PENDING_WHATSAPP' | 'CONFIRMED' | 'CANCELLED';
    created_at?: string;
    updated_at?: string;
}

