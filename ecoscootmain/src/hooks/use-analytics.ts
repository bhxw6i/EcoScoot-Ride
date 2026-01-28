
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

// Custom hook to fetch analytics data for a given time period
export function useAnalyticsData(period: '7days' | '30days' | '90days' = '7days') {
  const [isLoading, setIsLoading] = useState(true);
  const [dailyRideData, setDailyRideData] = useState<Array<{date: string; count: number}>>([]);
  const [revenueData, setRevenueData] = useState<Array<{date: string; amount: number}>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate date range based on selected period
        const today = new Date();
        let startDate;
        
        if (period === '7days') {
          startDate = subDays(today, 6);
        } else if (period === '30days') {
          startDate = subDays(today, 29);
        } else {
          startDate = subDays(today, 89);
        }
        
        // Format dates for database queries
        const startDateStr = startOfDay(startDate).toISOString();
        const endDateStr = endOfDay(today).toISOString();

        // Fetch bookings for ride count
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('created_at')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        if (bookingsError) {
          throw new Error(`Error fetching bookings: ${bookingsError.message}`);
        }

        // Fetch payments for revenue data
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('created_at, amount')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        if (paymentsError) {
          throw new Error(`Error fetching payments: ${paymentsError.message}`);
        }

        // Process ride data
        const ridesByDay = new Map<string, number>();
        const revenueByDay = new Map<string, number>();
        
        // Initialize all days in the period with 0 values
        let currentDate = new Date(startDate);
        const lastDate = new Date(today);
        
        while (currentDate <= lastDate) {
          const formattedDate = format(currentDate, 'MMM dd');
          ridesByDay.set(formattedDate, 0);
          revenueByDay.set(formattedDate, 0);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Count rides for each day
        bookingsData.forEach((booking) => {
          const day = format(new Date(booking.created_at), 'MMM dd');
          ridesByDay.set(day, (ridesByDay.get(day) || 0) + 1);
        });
        
        // Sum revenue for each day
        paymentsData.forEach((payment) => {
          const day = format(new Date(payment.created_at), 'MMM dd');
          revenueByDay.set(day, (revenueByDay.get(day) || 0) + payment.amount);
        });
        
        // Convert maps to arrays for charts
        const rideChartData = Array.from(ridesByDay.entries()).map(([date, count]) => ({
          date,
          count,
        }));
        
        const revenueChartData = Array.from(revenueByDay.entries()).map(([date, amount]) => ({
          date,
          amount,
        }));
        
        // Sort by date
        rideChartData.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
        revenueChartData.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        
        setDailyRideData(rideChartData);
        setRevenueData(revenueChartData);
        
      } catch (err) {
        console.error("Error in useAnalyticsData:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return { isLoading, dailyRideData, revenueData, error };
}

// Helper function to format currency values
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

// Helper function to calculate percentage change
export function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+∞%" : "0%";
  
  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}
