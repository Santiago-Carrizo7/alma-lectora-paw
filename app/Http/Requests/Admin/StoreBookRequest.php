<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'isbn' => ['required', 'string', 'max:20', 'unique:books,isbn'],
            'title' => ['required', 'string', 'max:255'],
            'original_title' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'genre' => ['nullable', 'string', 'max:100'],
            'synopsis' => ['nullable', 'string'],
            'cover_url' => ['nullable', 'string', 'max:2048'],
            'badge' => ['nullable', 'string', 'max:50'],
            'promo_quantity' => ['nullable', 'integer', 'min:2'],
            'promo_price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'published_date' => ['nullable', 'string', 'max:50'],
            'language' => ['nullable', 'string', 'max:10'],
            'additional_images' => ['nullable', 'array'],
            'additional_images.*' => ['string', 'max:2048'],
            'authors' => ['nullable', 'array'],
            'authors.*' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Custom validation messages in Spanish.
     */
    public function messages(): array
    {
        return [
            'isbn.required' => 'El código ISBN es obligatorio.',
            'isbn.unique' => 'Ya existe un libro registrado con este ISBN.',
            'title.required' => 'El título del libro es obligatorio.',
            'price.required' => 'El precio es obligatorio.',
            'price.numeric' => 'El precio debe ser un valor numérico.',
            'price.min' => 'El precio no puede ser negativo.',
            'stock.required' => 'El stock es obligatorio.',
            'stock.integer' => 'El stock debe ser un número entero.',
            'stock.min' => 'El stock no puede ser negativo.',
        ];
    }
}
