<?php

namespace App\Http\Requests;

use App\Support\ContactNormalizer;
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
     * Normalize formatted DNI/CUIT and phone numbers to plain digits before validating.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'customer_dni' => ContactNormalizer::digits($this->input('customer_dni')),
            'customer_phone' => ContactNormalizer::digits($this->input('customer_phone')),
        ]);
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
            'customer_phone' => ['required', 'string', 'digits_between:8,15'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_dni' => ['required', 'string', 'digits_between:7,11'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1', 'max:30'],
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
            'items.max' => 'No podés incluir más de 30 ítems distintos en un mismo pedido.',
            ...ContactNormalizer::messages('customer_dni', 'customer_phone'),
        ];
    }
}
