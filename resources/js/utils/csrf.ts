/**
 * Utility functions for handling CSRF tokens in API requests
 */

/**
 * Get the CSRF token from the meta tag
 */
export function getCsrfToken(): string {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!token) {
        console.error('CSRF token not found in meta tag');
        throw new Error('CSRF token not found');
    }
    return token;
}

/**
 * Safely encode string to base64, handling Unicode characters
 */
export function safeBase64Encode(str: string): string {
    try {
        // First encode to UTF-8 bytes, then to base64
        return btoa(unescape(encodeURIComponent(str)));
    } catch (error) {
        console.error('Error encoding to base64:', error);
        // Fallback: return empty string or handle error as needed
        return '';
    }
}

/**
 * Get headers for API requests with CSRF token
 */
export function getApiHeaders(): Record<string, string> {
    return {
        'Accept': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
    };
}

/**
 * Make an API request with proper CSRF handling
 */
export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
        ...getApiHeaders(),
        ...options.headers,
    };

    return fetch(url, {
        ...options,
        headers,
    });
}
