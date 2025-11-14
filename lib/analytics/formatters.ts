// Value Formatters for Analytics

/**
 * Format currency value (default to MYR)
 * @param value - Numeric value to format
 * @param currency - Currency code (default: MYR)
 */
export function formatCurrency(value: number, currency: string = 'MYR'): string {
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${formatNumber(value, 2)}`
}

/**
 * Get currency symbol from code
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    MYR: 'RM ',
    SGD: 'S$',
    USD: '$',
    EUR: '€',
    GBP: '£',
  }
  return symbols[currency] || currency + ' '
}

/**
 * Format number with commas and optional decimals
 * @param value - Numeric value to format
 * @param decimals - Number of decimal places (default: 0)
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format percentage value
 * @param value - Numeric value (e.g., 0.075 for 7.5%)
 * @param decimals - Number of decimal places (default: 1)
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format large numbers in compact form (1.2k, 1.2M, etc.)
 * Used for chart axis labels
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  } else {
    return value.toString()
  }
}

/**
 * Format comparison percentage with sign and arrow
 * @param percentageChange - Percentage change value (positive or negative)
 */
export function formatComparisonPercentage(percentageChange: number): string {
  const sign = percentageChange >= 0 ? '+' : ''
  const arrow = percentageChange >= 0 ? '↑' : '↓'
  return `${sign}${percentageChange.toFixed(1)}% ${arrow}`
}

/**
 * Calculate percentage change between two values
 * Returns 0 if previous value is 0
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return ((current - previous) / previous) * 100
}
