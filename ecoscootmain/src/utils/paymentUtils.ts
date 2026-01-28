import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PaymentRecord {
  id?: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  payment_type: string;
  status: string;
  notes?: string;
  created_at?: string;
  transaction_id?: string | null;
}

/**
 * Creates a payment record for a booking
 * @param bookingId - The ID of the booking
 * @param userId - The user ID
 * @param amount - The payment amount
 * @param paymentMethod - The payment method (card, cash, upi, bank)
 * @param status - The payment status (defaults to 'completed' for card, 'pending' for cash)
 * @param cardDetails - Optional card details for card payments
 * @returns A promise that resolves to the payment record or null if there was an error
 */
export const createPaymentRecord = async (
  bookingId: string,
  userId: string,
  amount: number,
  paymentMethod: string = 'card',
  status?: string,
  cardDetails?: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
  }
) => {
  try {
    console.log("Creating payment record:", { bookingId, userId, amount, paymentMethod });
    
    // Determine payment status based on method if not explicitly provided
    const paymentStatus = status || (paymentMethod === 'cash' ? 'pending' : 'completed');
    
    // Generate a transaction ID for card payments
    const transactionId = paymentMethod === 'card' 
      ? `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}` 
      : null;
    
    const paymentData: PaymentRecord = {
      booking_id: bookingId,
      user_id: userId,
      amount: amount,
      payment_method: paymentMethod,
      payment_type: 'payment',
      status: paymentStatus,
      notes: `Payment for booking ${bookingId} via ${paymentMethod.toUpperCase()}`,
      transaction_id: transactionId
    };
    
    console.log("Saving payment data to Supabase:", paymentData);
    
    // Insert payment record with explicit column names
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        booking_id: paymentData.booking_id,
        user_id: paymentData.user_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        payment_type: paymentData.payment_type,
        status: paymentData.status,
        notes: paymentData.notes,
        transaction_id: paymentData.transaction_id
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating payment record:", error);
      return null;
    }
    
    console.log("Payment record created successfully:", data);
    return data;
  } catch (error) {
    console.error("Unexpected error creating payment record:", error);
    return null;
  }
};

/**
 * Gets payment records for a user
 * @param userId - The user ID to get payments for
 * @returns Array of payment records
 */
export const getUserPayments = async (userId: string): Promise<PaymentRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching user payments:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching payments:", error);
    return [];
  }
};

/**
 * Gets payment records for a booking
 * @param bookingId - The booking ID to get payments for
 * @returns Array of payment records
 */
export const getBookingPayments = async (bookingId: string): Promise<PaymentRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching booking payments:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching payments:", error);
    return [];
  }
};

/**
 * Updates a payment status
 * @param paymentId - The payment ID to update
 * @param status - The new status
 * @returns Updated payment record or null
 */
export const updatePaymentStatus = async (
  paymentId: string, 
  status: string
): Promise<PaymentRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating payment status:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Unexpected error updating payment:", error);
    return null;
  }
};
