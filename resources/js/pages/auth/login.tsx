import React from 'react';
import AuthHub from '@/components/auth/auth-hub';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
    initialTab?: 'login' | 'register';
}

export default function Login({ status, canResetPassword = true, initialTab = 'login' }: LoginProps) {
    return (
        <AuthHub
            initialTab={initialTab}
            status={status}
            canResetPassword={canResetPassword}
        />
    );
}
