// Date Utilities for Analytics

import {
  subDays,
  format,
  differenceInDays,
  startOfDay,
  endOfDay,
} from 'date-fns'
import type { DateRangePreset, DateRange } from './types'

/**
 * Get date range based on preset
 */
export function getDateRange(preset: DateRangePreset): DateRange {
  const endDate = endOfDay(new Date())

  switch (preset) {
    case 'last7days':
      return {
        startDate: startOfDay(subDays(endDate, 6)), // 6 days ago + today = 7 days
        endDate,
      }
    case 'last14days':
      return {
        startDate: startOfDay(subDays(endDate, 13)), // 13 days ago + today = 14 days
        endDate,
      }
    case 'custom':
      // For custom, calling code should provide dates
      return {
        startDate: startOfDay(subDays(endDate, 13)), // Default to 14 days
        endDate,
      }
    default:
      return {
        startDate: startOfDay(subDays(endDate, 13)),
        endDate,
      }
  }
}

/**
 * Get the previous period for comparison
 * For example, if current period is last 7 days, previous is the 7 days before that
 */
export function getPreviousPeriod(
  startDate: Date,
  endDate: Date
): DateRange {
  const daysDifference = differenceInDays(endDate, startDate) + 1 // +1 to include both start and end
  const previousEndDate = startOfDay(subDays(startDate, 1))
  const previousStartDate = startOfDay(subDays(previousEndDate, daysDifference - 1))

  return {
    startDate: previousStartDate,
    endDate: endOfDay(previousEndDate),
  }
}

/**
 * Format date for chart display
 * Adapts format based on range length
 */
export function formatDateForChart(date: Date, rangeDays: number): string {
  if (rangeDays <= 7) {
    // Short format for 7 days: "Mon 1"
    return format(date, 'EEE d')
  } else if (rangeDays <= 31) {
    // Medium format for 14-31 days: "Jan 1"
    return format(date, 'MMM d')
  } else {
    // Longer format for 30+ days: "Jan 1"
    return format(date, 'MMM d')
  }
}

/**
 * Format date for tooltip (full format)
 */
export function formatDateForTooltip(date: Date): string {
  return format(date, 'MMMM d, yyyy')
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
}

/**
 * Calculate number of days between two dates (inclusive)
 */
export function calculateDaysDifference(
  startDate: Date,
  endDate: Date
): number {
  return differenceInDays(endDate, startDate) + 1 // +1 to include both dates
}

/**
 * Convert Date to ISO date string (YYYY-MM-DD) for database queries
 */
export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Check if a date range is valid (end date after start date)
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return endDate >= startDate
}
