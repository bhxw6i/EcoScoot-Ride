import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  Activity,
  CreditCard as CreditCardIcon,
  DollarSign,
  Users,
  BarChart as BarChartIcon,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from 'date-fns';
import { AnalyticsData } from '../staff/user-support/types';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

interface TimeRange {
  label: string;
  value: number;
}

interface AnalyticsApiResponse {
  success: boolean;
  data: AnalyticsData[];
  error?: string;
}

export default function AdminAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<AnalyticsData[]>([]);
  const [userSignupsData, setUserSignupsData] = useState<AnalyticsData[]>([]);
  const [bookingsData, setBookingsData] = useState<AnalyticsData[]>([]);
  const [availableScootersCount, setAvailableScootersCount] = useState(0);
  const [totalScootersCount, setTotalScootersCount] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>({ label: '7d', value: 7 });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Fetch revenue data
      await fetchRevenueData();

      // Fetch user signups data
      await fetchUserSignupsData();

      // Fetch bookings data
      await fetchBookingsData();
      
      // Fetch scooter data
      await fetchScooterData();
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScooterData = async () => {
    try {
      // Get all scooters to calculate total count
      const { data: allScooters, error: totalError } = await supabase
        .from('scooters')
        .select('id');
      
      if (totalError) throw totalError;
      
      setTotalScootersCount(allScooters?.length || 0);
      
      // Get available scooters count
      const { data: availableScooters, error: availableError } = await supabase
        .from('scooters')
        .select('id')
        .eq('status', 'available');
      
      if (availableError) throw availableError;
      
      setAvailableScootersCount(availableScooters?.length || 0);
    } catch (error) {
      console.error("Error fetching scooter data:", error);
      throw error;
    }
  };

  const fetchRevenueData = async () => {
    try {
      // Get the date range
      const endDate = new Date();
      const startDate = subDays(endDate, timeRange.value);
      
      // Initialize a Map to hold the revenue by date
      const revenueByDate = new Map();
      
      // Ensure all dates in the range are represented (initialized to 0)
      for (let i = 0; i <= timeRange.value; i++) {
        const date = subDays(endDate, i);
        const dateString = format(date, 'yyyy-MM-dd');
        revenueByDate.set(dateString, 0);
      }
      
      // Fetch payment data from the database
      const { data, error } = await supabase
        .from('payments')
        .select('amount, created_at, payment_type')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (error) throw error;
      
      // Aggregate the revenue by date
      data?.forEach(payment => {
        const date = format(new Date(payment.created_at), 'yyyy-MM-dd');
        if (revenueByDate.has(date)) {
          let currentAmount = revenueByDate.get(date);
          // Add to revenue for payments, subtract for refunds
          if (payment.payment_type === 'payment') {
            currentAmount += Number(payment.amount);
          } else if (payment.payment_type === 'refund') {
            currentAmount -= Number(payment.amount);
          }
          revenueByDate.set(date, currentAmount);
        }
      });
      
      // Convert the Map to an array of objects for the chart
      const formattedData: AnalyticsData[] = Array.from(revenueByDate).map(([date, value]) => ({
        id: date,
        name: format(new Date(date), 'MMM dd'),
        value: value,
        date: date
      })).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
      
      setRevenueData(formattedData);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      throw error;
    }
  };

  const fetchUserSignupsData = async () => {
    try {
      // Get the date range
      const endDate = new Date();
      const startDate = subDays(endDate, timeRange.value);
      
      // Initialize a Map to hold the signups by date
      const signupsByDate = new Map();
      
      // Ensure all dates in the range are represented (initialized to 0)
      for (let i = 0; i <= timeRange.value; i++) {
        const date = subDays(endDate, i);
        const dateString = format(date, 'yyyy-MM-dd');
        signupsByDate.set(dateString, 0);
      }
      
      // Fetch user profile data from the database
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (error) throw error;
      
      // Aggregate the signups by date
      data?.forEach(profile => {
        const date = format(new Date(profile.created_at), 'yyyy-MM-dd');
        if (signupsByDate.has(date)) {
          const currentCount = signupsByDate.get(date);
          signupsByDate.set(date, currentCount + 1);
        }
      });
      
      // Convert the Map to an array of objects for the chart
      const formattedData: AnalyticsData[] = Array.from(signupsByDate).map(([date, value]) => ({
        id: date,
        name: format(new Date(date), 'MMM dd'),
        value: value,
        date: date
      })).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
      
      setUserSignupsData(formattedData);
    } catch (error) {
      console.error("Error fetching user signups data:", error);
      throw error;
    }
  };

  const fetchBookingsData = async () => {
    try {
      // Get the date range
      const endDate = new Date();
      const startDate = subDays(endDate, timeRange.value);
      
      // Initialize a Map to hold the bookings by date
      const bookingsByDate = new Map();
      
      // Ensure all dates in the range are represented (initialized to 0)
      for (let i = 0; i <= timeRange.value; i++) {
        const date = subDays(endDate, i);
        const dateString = format(date, 'yyyy-MM-dd');
        bookingsByDate.set(dateString, 0);
      }
      
      // Fetch booking data from the database
      const { data, error } = await supabase
        .from('bookings')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (error) throw error;
      
      // Aggregate the bookings by date
      data?.forEach(booking => {
        const date = format(new Date(booking.created_at), 'yyyy-MM-dd');
        if (bookingsByDate.has(date)) {
          const currentCount = bookingsByDate.get(date);
          bookingsByDate.set(date, currentCount + 1);
        }
      });
      
      // Convert the Map to an array of objects for the chart
      const formattedData: AnalyticsData[] = Array.from(bookingsByDate).map(([date, value]) => ({
        id: date,
        name: format(new Date(date), 'MMM dd'),
        value: value,
        date: date
      })).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
      
      setBookingsData(formattedData);
    } catch (error) {
      console.error("Error fetching bookings data:", error);
      throw error;
    }
  };

  const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md shadow-sm p-2 text-sm">
          <p className="font-medium">{label}</p>
          <p className="text-primary">{`${payload[0].name}: ${typeof payload[0].value === 'number' ? payload[0].value.toFixed(2) : payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const StatsCard = ({ title, value, change, icon, trend }: { title: string, value: string, change: string, icon: JSX.Element, trend: "up" | "down" | "neutral" }) => {
    return (
      <Card className="border border-border transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="flex items-center text-xs text-muted-foreground mt-1">
            {trend === "up" ? (
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
            ) : trend === "down" ? (
              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
            ) : null}
            <span className={trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : ""}>
              {change}
            </span>
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track key metrics and analyze business performance</p>
      </header>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard 
              title="Total Revenue" 
              value={`$${revenueData.reduce((sum, item) => sum + Number(item.value), 0).toFixed(0)}`}
              change="+12.5% from last month"
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              trend="up"
            />
            <StatsCard 
              title="New Users" 
              value={`${userSignupsData.reduce((sum, item) => sum + Number(item.value), 0)}`}
              change="+7.2% from last month"
              icon={<Users className="h-5 w-5 text-primary" />}
              trend="up"
            />
            <StatsCard 
              title="Active Bookings" 
              value={`${bookingsData.reduce((sum, item) => sum + Number(item.value), 0)}`}
              change="-3.1% from last month"
              icon={<Activity className="h-5 w-5 text-primary" />}
              trend="down"
            />
            <StatsCard 
              title="Available Scooters" 
              value={`${availableScootersCount}`}
              change={`${totalScootersCount > 0 ? Math.round((availableScootersCount / totalScootersCount) * 100) : 0}% of total fleet`}
              icon={<CreditCardIcon className="h-5 w-5 text-primary" />}
              trend="neutral"
            />
          </div>
          
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Daily revenue for the last {timeRange.value} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary) / 0.2)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>User Registrations</CardTitle>
                <CardDescription>New user sign-ups for the last {timeRange.value} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userSignupsData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 grid-cols-1 mb-8">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Booking Activity</CardTitle>
                <CardDescription>Daily bookings for the last {timeRange.value} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingsData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="value" 
                        fill="hsl(var(--secondary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
