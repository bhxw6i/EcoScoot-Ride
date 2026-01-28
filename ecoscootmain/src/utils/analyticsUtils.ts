
import { format, subDays, startOfDay, endOfDay, parse } from "date-fns";

/**
 * Calculates the date range based on the selected period
 */
export function getDateRange(period: '7days' | '30days' | '90days') {
  const today = new Date();
  let startDate;
  
  if (period === '7days') {
    startDate = subDays(today, 6);
  } else if (period === '30days') {
    startDate = subDays(today, 29);
  } else {
    startDate = subDays(today, 89);
  }
  
  return {
    start: startOfDay(startDate).toISOString(),
    end: endOfDay(today).toISOString()
  };
}

/**
 * Calculates total revenue from an array of payment data
 */
export function calculateTotalRevenue(payments: { amount: number }[]): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}

/**
 * Calculates the percentage change between two values
 */
export function calculateGrowth(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+∞%" : "0%";
  
  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

/**
 * Groups data by a specific time period (day, week, month)
 */
export function groupDataByPeriod(
  data: Array<{ created_at: string, [key: string]: any }>,
  valueKey: string,
  period: 'day' | 'week' | 'month' = 'day'
): Array<{ period: string, value: number }> {
  const groupedData = new Map<string, number>();
  
  data.forEach(item => {
    let periodKey: string;
    const date = new Date(item.created_at);
    
    if (period === 'day') {
      periodKey = format(date, 'yyyy-MM-dd');
    } else if (period === 'week') {
      // Get the week number and year
      periodKey = `${format(date, 'yyyy')}-W${format(date, 'ww')}`;
    } else {
      periodKey = format(date, 'yyyy-MM');
    }
    
    const currentValue = groupedData.get(periodKey) || 0;
    groupedData.set(periodKey, currentValue + Number(item[valueKey] || 0));
  });
  
  // Convert map to array and format period label
  return Array.from(groupedData.entries()).map(([periodKey, value]) => {
    let periodLabel: string;
    
    if (period === 'day') {
      periodLabel = format(parse(periodKey, 'yyyy-MM-dd', new Date()), 'MMM dd');
    } else if (period === 'week') {
      // Format as "Week W of YYYY"
      const [year, week] = periodKey.split('-W');
      periodLabel = `Week ${week}, ${year}`;
    } else {
      periodLabel = format(parse(periodKey, 'yyyy-MM', new Date()), 'MMM yyyy');
    }
    
    return { period: periodLabel, value };
  }).sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Extracts the most popular starting locations from bookings
 */
export function getTopLocations(
  bookings: Array<{ start_location: string | null, pickup_location: string | null }>
): Array<{ location: string, count: number }> {
  const locationCounts = new Map<string, number>();
  
  // Count occurrences of each location
  bookings.forEach(booking => {
    if (booking.start_location) {
      const loc = booking.start_location;
      locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);
    }
    if (booking.pickup_location) {
      const loc = booking.pickup_location;
      locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);
    }
  });
  
  // Convert to array, sort by count (descending) and take top entries
  return Array.from(locationCounts.entries())
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
}
