<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QaDefenseFixesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app()->setLocale('es');
    }

    private function registrationPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Lectora Nueva',
            'email' => 'lectora@example.com',
            'dni' => '35123456',
            'phone' => '5493875123456',
            'address' => 'Av. San Martín 123',
            'postal_code' => '4400',
            'password' => 'password',
            'password_confirmation' => 'password',
        ], $overrides);
    }

    public function test_duplicate_email_registration_shows_spanish_message(): void
    {
        User::factory()->create(['email' => 'lectora@example.com']);

        $response = $this->post('/register', $this->registrationPayload());

        $response->assertSessionHasErrors([
            'email' => 'El correo electrónico ya está en uso.',
        ]);
    }

    public function test_registration_validation_messages_are_translated(): void
    {
        $response = $this->post('/register', $this->registrationPayload([
            'name' => '',
            'password' => 'abc',
            'password_confirmation' => 'xyz',
        ]));

        $response->assertSessionHasErrors([
            'name' => 'El campo nombre es obligatorio.',
            'password' => 'La confirmación del campo contraseña no coincide.',
        ]);

        $errors = session('errors')->getBag('default')->all();
        foreach ($errors as $message) {
            $this->assertStringNotContainsString('validation.', $message);
        }
    }
}
