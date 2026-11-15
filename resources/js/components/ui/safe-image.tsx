import React, { useEffect, useState } from 'react';

interface SafeImageProps {
    src: string | null | undefined;
    alt: string;
    className?: string;
    fallback: React.ReactNode;
    loading?: 'lazy' | 'eager';
    decoding?: 'async' | 'sync' | 'auto';
}

export function SafeImage({
    src,
    alt,
    className = '',
    fallback,
    loading = 'lazy',
    decoding = 'async',
}: SafeImageProps) {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [src]);

    if (!src || hasError) {
        return <>{fallback}</>;
    }

    return (
        <img
            src={src}
            alt={alt}
            loading={loading}
            decoding={decoding}
            onError={() => setHasError(true)}
            className={className}
        />
    );
}
