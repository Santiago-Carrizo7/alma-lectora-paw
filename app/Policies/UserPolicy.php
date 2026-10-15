<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determina si el usuario puede listar usuarios.
     */
    public function viewAny(User $currentUser): bool
    {
        return $currentUser->hasRole('super-admin');
    }

    /**
     * Determina si el usuario puede ver la ficha de otro usuario.
     */
    public function view(User $currentUser, User $targetUser): bool
    {
        return $currentUser->hasRole('super-admin') || $currentUser->id === $targetUser->id;
    }

    /**
     * Determina si el usuario puede crear nuevos usuarios.
     */
    public function create(User $currentUser): bool
    {
        return $currentUser->hasRole('super-admin');
    }

    /**
     * Determina si el usuario puede actualizar a otro usuario (o a sí mismo).
     */
    public function update(User $currentUser, User $targetUser): bool
    {
        // Solo Super Admin puede editar a otros usuarios
        if ($currentUser->id !== $targetUser->id && !$currentUser->hasRole('super-admin')) {
            return false;
        }

        return true;
    }

    /**
     * Determina si el usuario puede eliminar a otro usuario.
     */
    public function delete(User $currentUser, User $targetUser): bool
    {
        // REGLA CRÍTICA: Nadie puede eliminarse a sí mismo
        if ($currentUser->id === $targetUser->id) {
            return false;
        }

        // Solo un Super Admin puede eliminar otros usuarios
        return $currentUser->hasRole('super-admin');
    }

    /**
     * Determina si el usuario puede administrar roles y permisos.
     */
    public function manageRoles(User $currentUser): bool
    {
        return $currentUser->hasRole('super-admin');
    }
}
