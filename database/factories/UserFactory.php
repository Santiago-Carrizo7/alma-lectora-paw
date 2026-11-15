<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
            'is_active' => true,
        ])->afterCreating(function (\App\Models\User $user): void {
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            $roleAdmin = \Spatie\Permission\Models\Role::firstOrCreate([
                'name' => 'admin',
                'guard_name' => 'web',
            ]);

            if ($roleAdmin->permissions()->count() === 0) {
                foreach (\Database\Seeders\RolesAndPermissionsSeeder::ADMIN_PERMISSIONS as $permName) {
                    \Spatie\Permission\Models\Permission::firstOrCreate([
                        'name' => $permName,
                        'guard_name' => 'web',
                    ]);
                }
                $roleAdmin->syncPermissions(\Database\Seeders\RolesAndPermissionsSeeder::ADMIN_PERMISSIONS);
            }

            if (! $user->hasRole('admin')) {
                $user->assignRole($roleAdmin);
            }
        });
    }

    public function client(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'client',
            'is_active' => true,
            'dni' => (string) fake()->numberBetween(25000000, 46000000),
            'phone' => '+54 9 387 ' . fake()->numerify('###-####'),
            'address' => fake()->streetAddress(),
            'postal_code' => fake()->randomElement(['4400', '4401', '4405', '4407']),
        ]);
    }
}
