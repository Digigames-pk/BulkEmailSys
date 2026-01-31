/**
 * Utility functions for handling CSRF tokens in API requests
 */

/**
 * Get the CSRF token from the XSRF-TOKEN cookie (Laravel SPA standard).
 * Cookie value is URL-encoded; decode before sending as X-XSRF-TOKEN.
 */
function getXsrfTokenFromCookie(): string | null {
    const name = 'XSRF-TOKEN';
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    if (match) {
        try {
            // Cookie value may be URL-encoded; Laravel expects the same value it set
            return decodeURIComponent(match[2].trim());
        } catch {
            return match[2]?.trim() ?? null;
        }
    }
    return null;
}

/**
 * Get the CSRF token from the meta tag (fallback)
 */
function getCsrfTokenFromMeta(): string | null {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? null;
}

/**
 * Get the CSRF token (meta first, then XSRF-TOKEN cookie)
 */
export function getCsrfToken(): string {
    const fromMeta = getCsrfTokenFromMeta();
    if (fromMeta) return fromMeta;
    const fromCookie = getXsrfTokenFromCookie();
    if (fromCookie) return fromCookie;
    console.error('CSRF token not found in meta tag or XSRF-TOKEN cookie');
    throw new Error('CSRF token not found');
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
 * Get headers for API requests with CSRF token.
 * Sends both X-CSRF-TOKEN (from meta) and X-XSRF-TOKEN (from cookie) when available
 * so Laravel's VerifyCsrfToken can validate.
 */
export function getApiHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    const fromMeta = getCsrfTokenFromMeta();
    if (fromMeta) {
        headers['X-CSRF-TOKEN'] = fromMeta;
    }

    const fromCookie = getXsrfTokenFromCookie();
    if (fromCookie) {
        headers['X-XSRF-TOKEN'] = fromCookie;
    }

    if (!headers['X-CSRF-TOKEN'] && !headers['X-XSRF-TOKEN']) {
        throw new Error('CSRF token not found');
    }

    return headers;
}

/**
 * Make an API request with proper CSRF handling.
 * Uses credentials: 'include' so session and XSRF-TOKEN cookie are sent.
 */
export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
        ...getApiHeaders(),
        ...(options.headers as Record<string, string>),
    };

    return fetch(url, {
        ...options,
        credentials: 'include',
        headers,
    });
}
