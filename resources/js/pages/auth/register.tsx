import React from 'react';
import AuthHub from '@/components/auth/auth-hub';

interface RegisterProps {
    initialTab?: 'login' | 'register';
    status?: string;
}

export default function Register({ initialTab = 'register', status }: RegisterProps) {
    return (
        <AuthHub
            initialTab={initialTab}
            status={status}
        />
    );
}
