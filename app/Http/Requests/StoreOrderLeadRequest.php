<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderLeadRequest extends FormRequest
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
            'customer_name' => ['required', 'string', 'min:2', 'max:150'],
            'customer_phone' => ['required', 'string', 'min:6', 'max:50'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_dni' => ['required', 'string', 'min:5', 'max:20'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'uuid'],
            'items.*.type' => ['required', 'string', 'in:BOOK,ACCESSORY,COMBO'],
            'items.*.title' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'total_amount' => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * Custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'customer_name.required' => 'El nombre es obligatorio.',
            'customer_phone.required' => 'El teléfono de contacto es obligatorio.',
            'customer_email.required' => 'El correo electrónico es obligatorio.',
            'customer_email.email' => 'El formato del correo electrónico no es válido.',
            'customer_dni.required' => 'El DNI o CUIT es obligatorio.',
            'items.required' => 'El carrito no puede estar vacío.',
            'items.min' => 'Debes incluir al menos un producto en el pedido.',
        ];
    }
}
