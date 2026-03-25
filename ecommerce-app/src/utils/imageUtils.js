/**
 * Formats the product image URL correctly.
 * If it's a local path starting with /uploads, it prefixes with the server URL.
 * Otherwise, it returns the URL as is (or a placeholder if null).
 * @param {string} url - The image URL or local path
 * @returns {string} - The formatted URL
 */
export const getProductImageUrl = (url) => {
    if (!url) return null;

    if (url.startsWith('http')) {
        return url;
    }

    // Clean potential double slashes
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;

    // Use server URL from env variables
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';
    return `${serverUrl}${cleanUrl}`;
};
