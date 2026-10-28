/**
 * Indian & Global Financial Formatting Utilities
 * Adheres to Indian Numbering System (Lakhs, Crores, INR ₹)
 */

export const formatIndianNumber = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-IN');
};

/**
 * Format Currency in Indian Rupees (₹) with en-IN comma grouping
 * e.g. 150000 -> ₹1,50,000
 * e.g. 12500000 -> ₹1,25,00,000
 */
export const formatCurrency = (val, currency = 'INR') => {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  const num = Number(val);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Compact Indian Notation (Thousands, Lakhs, Crores)
 * e.g. 15000000 -> ₹1.5 Cr
 * e.g. 450000   -> ₹4.5 L
 * e.g. 85000    -> ₹85 K
 */
export const formatCompactNumber = (number) => {
  if (!number && number !== 0) return '₹0';
  const num = Math.abs(Number(number));
  const sign = Number(number) < 0 ? '-' : '';

  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '');
    return `${sign}₹${cr} Cr`;
  }
  if (num >= 100000) {
    const lk = (num / 100000).toFixed(2).replace(/\.00$/, '');
    return `${sign}₹${lk} L`;
  }
  if (num >= 1000) {
    const k = (num / 1000).toFixed(1).replace(/\.0$/, '');
    return `${sign}₹${k} K`;
  }
  return `${sign}₹${num.toLocaleString('en-IN')}`;
};

/**
 * Formats in Lakhs or Crores with full label
 * e.g. ₹1.25 Crore, ₹45.5 Lakh
 */
export const formatLakhCrore = (number) => {
  if (!number && number !== 0) return '₹0';
  const num = Math.abs(Number(number));
  const sign = Number(number) < 0 ? '-' : '';

  if (num >= 10000000) {
    return `${sign}₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `${sign}₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return `${sign}₹${num.toLocaleString('en-IN')}`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};
