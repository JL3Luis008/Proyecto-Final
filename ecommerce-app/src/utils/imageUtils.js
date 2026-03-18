/**
 * Formats the product image URL correctly.
 * If it's a local path starting with /uploads, it prefixes with the server URL.
 * Otherwise, it returns the URL as is (or a placeholder if null).
 * @param {string} url - The image URL or local path
 * @returns {string} - The formatted URL
 */
export const getProductImageUrl = (url) => {
    if (!url) return '/img/products/placeholder.svg';

    if (url.startsWith('http')) {
        return url;
    }

    // Clean potential double slashes
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;

    // Use port 4000 as per user configuration
    return `http://localhost:4000${cleanUrl}`;
};
