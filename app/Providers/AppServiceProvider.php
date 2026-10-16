<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Support\Facades\Gate::policy(\App\Models\User::class, \App\Policies\UserPolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\OrderLead::class, \App\Policies\OrderLeadPolicy::class);

        // Notificación de restablecimiento de contraseña en español con branding Alma Lectora
        ResetPassword::toMailUsing(function ($notifiable, string $token) {
            $resetUrl = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            return (new MailMessage)
                ->subject('Restablecer Contraseña - Alma Lectora')
                ->greeting('¡Hola, ' . ($notifiable->name ?? 'Lector/a') . '!')
                ->line('Recibiste este correo porque se solicitó un restablecimiento de contraseña para tu cuenta en Alma Lectora.')
                ->action('Restablecer mi Contraseña', $resetUrl)
                ->line('Este enlace de recuperación expirará en ' . config('auth.passwords.users.expire', 60) . ' minutos.')
                ->line('Si no solicitaste este cambio, no te preocupes: podés ignorar este mensaje de forma segura.')
                ->salutation('Saludos cordiales, el equipo de Alma Lectora');
        });
    }
}
