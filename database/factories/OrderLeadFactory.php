<?php

namespace Database\Factories;

use App\Models\OrderLead;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderLead>
 */
class OrderLeadFactory extends Factory
{
    protected $model = OrderLead::class;

    public function definition(): array
    {
        return [
            'user_id' => null,
            'customer_name' => fake()->name(),
            'customer_phone' => '+54 9 387 ' . fake()->numerify('###-####'),
            'customer_email' => fake()->safeEmail(),
            'customer_dni' => (string) fake()->numberBetween(25000000, 46000000),
            'postal_code' => fake()->randomElement(['4400', '4401', '4405']),
            'address' => fake()->streetAddress(),
            'items' => [],
            'total_amount' => 0,
            'status' => 'CONFIRMED',
        ];
    }

    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
            'customer_name' => $user->name,
            'customer_email' => $user->email,
            'customer_dni' => $user->dni ?? (string) fake()->numberBetween(25000000, 46000000),
            'customer_phone' => $user->phone ?? '+54 9 387 555-0101',
            'postal_code' => $user->postal_code ?? '4400',
            'address' => $user->address ?? 'Calle Falsa 123',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'PENDING_WHATSAPP',
        ]);
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'CONFIRMED',
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'CANCELLED',
        ]);
    }
}
