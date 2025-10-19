/**
 * Safely formats a price value to 2 decimal places
 * Handles both string and number inputs from the backend
 */
export function formatPrice(price: string | number): string {
    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
}

/**
 * Safely formats a price with currency symbol
 */
export function formatPriceWithCurrency(price: string | number, currency: string = '$'): string {
    return `${currency}${formatPrice(price)}`;
}
