<?php

namespace App\Mail;

use App\Models\OrderLead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public OrderLead $order)
    {
    }

    public function envelope(): Envelope
    {
        $shortId = strtoupper(substr($this->order->id, 0, 8));

        return new Envelope(
            from: new Address(
                config('mail.from.address', 'pedidos@almalectora.com'),
                config('mail.from.name', 'Alma Lectora')
            ),
            subject: "¡Recibimos tu pedido en Alma Lectora! (Orden #{$shortId})",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-confirmation',
            with: [
                'order' => $this->order,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
