'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthInitializer() {
    const initialize = useAuthStore((state) => state.initialize);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            try {
                initialize();
            } catch (error) {
                console.error('Auth initialization error:', error);
            }
        }
    }, [mounted, initialize]);

    return null;
}
