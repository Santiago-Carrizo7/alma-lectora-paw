import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

export function useAuth() {
    const { auth } = usePage<SharedData>().props;
    const permissions: string[] = auth?.permissions || [];
    const roles: string[] = auth?.roles || [];

    /**
     * Retorna true si el usuario tiene el permiso solicitado.
     * Si es 'super-admin', tiene acceso total por defecto.
     */
    const can = (permission: string): boolean => {
        if (roles.includes('super-admin')) {
            return true;
        }
        return permissions.includes(permission);
    };

    /**
     * Retorna true si el usuario posee el rol (o alguno de los roles) especificados.
     */
    const hasRole = (role: string | string[]): boolean => {
        if (Array.isArray(role)) {
            return role.some((r) => roles.includes(r));
        }
        return roles.includes(role);
    };

    return {
        user: auth?.user,
        roles,
        permissions,
        can,
        hasRole,
        isSuperAdmin: roles.includes('super-admin'),
        isAdmin:
            roles.includes('super-admin') ||
            roles.includes('admin') ||
            (roles.some((r) => r !== 'client' && r !== 'guest') && permissions.length > 0),
    };
}
