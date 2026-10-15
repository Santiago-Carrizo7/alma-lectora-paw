<?php

namespace App\Policies;

use App\Models\OrderLead;
use App\Models\User;

class OrderLeadPolicy
{
    /**
     * Determina si el usuario puede listar órdenes generales.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['super-admin', 'admin']);
    }

    /**
     * Determina si el usuario puede ver los detalles de una orden en particular.
     * Solo un administrador o el cliente dueño de la orden pueden verla.
     */
    public function view(User $user, OrderLead $order): bool
    {
        if ($user->hasRole(['super-admin', 'admin'])) {
            return true;
        }

        return $order->user_id !== null && (string)$order->user_id === (string)$user->id;
    }

    /**
     * Determina si el usuario puede descargar el remito/comprobante de la orden.
     */
    public function downloadRemito(User $user, OrderLead $order): bool
    {
        return $this->view($user, $order);
    }

    /**
     * Determina si el usuario puede actualizar el estado de la orden.
     */
    public function update(User $user, OrderLead $order): bool
    {
        return $user->hasRole(['super-admin', 'admin']);
    }

    /**
     * Determina si el usuario puede eliminar la orden.
     */
    public function delete(User $user, OrderLead $order): bool
    {
        return $user->hasRole(['super-admin', 'admin']);
    }
}
