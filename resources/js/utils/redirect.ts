import { router } from '@inertiajs/react';

/**
 * Utility function to handle redirects after API calls
 * Use this instead of router.visit() when redirecting after a fetch/API call
 */
export function redirectAfterApiCall(url: string, delay: number = 0) {
    // Ensure the URL is properly formatted
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;

    if (delay > 0) {
        setTimeout(() => {
            window.location.href = cleanUrl;
        }, delay);
    } else {
        window.location.href = cleanUrl;
    }
}

/**
 * Utility function to handle redirects with Inertia (for non-API calls)
 * Use this for regular Inertia form submissions
 */
export function redirectWithInertia(url: string) {
    router.visit(url);
}
