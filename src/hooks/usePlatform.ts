import { useMemo } from 'react';
import type { Platform } from '@/lib/onboarding/types';

interface PlatformDetectionResult {
    platform: Platform;
    isMobile: boolean;
    isWeb: boolean;
    isTelegram: boolean;
    isNative: boolean;
}

export function usePlatform(): PlatformDetectionResult {
    return useMemo(() => {
        if (typeof window === 'undefined') {
            return { platform: 'web', isMobile: false, isWeb: true, isTelegram: false, isNative: false };
        }

        const ua = navigator.userAgent.toLowerCase();
        const win = window as unknown as { Telegram?: { WebApp?: unknown }; __TELEGRAM_WEB_APP__?: boolean };
        const isTelegram = !!(win.Telegram?.WebApp || ua.includes('telegram') || win.__TELEGRAM_WEB_APP__);
        
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
        
        const isNative = /sportwarren|sportwarren-app/i.test(ua);

        if (isTelegram) return { platform: 'telegram', isMobile, isWeb: false, isTelegram: true, isNative };
        if (isMobile && !isNative) return { platform: 'mobile', isMobile: true, isWeb: false, isTelegram: false, isNative: false };
        
        return { platform: 'web', isMobile: false, isWeb: true, isTelegram: false, isNative: false };
    }, []);
}

export function getPlatformFromWindow(): Platform {
    if (typeof window === 'undefined') return 'web';
    
    const ua = navigator.userAgent.toLowerCase();
    const win = window as unknown as { Telegram?: { WebApp?: unknown } };
    if (win.Telegram?.WebApp || ua.includes('telegram')) return 'telegram';
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) return 'mobile';
    
    return 'web';
}
