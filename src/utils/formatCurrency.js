/**
 * Formats a numeric amount as an Indian Rupee string.
 * Uses the official ₹ symbol for consistency across the app.
 *
 * Usage: formatCurrency(120) → "₹120"
 */
export const formatCurrency = (amount) => `₹${amount}`;
