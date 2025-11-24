import Razorpay from 'razorpay';
import { db } from '@/lib/db/drizzle';
import { creditTransactions, userCredits } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

// Initialize Razorpay instance - only if credentials are available
export const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

export interface CreateOrderPayload {
  userId: number;
  credits: number;
  amount: number; // Amount in paise (e.g., 50000 for ₹500)
}

export interface OrderDetails {
  orderId: string;
  key: string;
  email: string;
  amount: number;
  credits: number;
  description: string;
  prefill: {
    name: string;
    email: string;
  };
}

/**
 * Create a Razorpay order for credit purchase
 */
export async function createOrder({
  userId,
  credits,
  amount
}: CreateOrderPayload): Promise<OrderDetails | null> {
  try {
    if (!razorpay) {
      throw new Error('Razorpay is not configured');
    }

    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `lekhai_${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        credits: credits.toString()
      }
    });

    return {
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID || '',
      email: '', // Will be filled by client
      amount: amount,
      credits: credits,
      description: `Purchase ${credits} credits for Lekhai`,
      prefill: {
        name: '',
        email: ''
      }
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return null;
  }
}

/**
 * Verify payment signature and process payment
 */
export async function verifyPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  userId: number,
  credits: number
): Promise<{ success: boolean; message: string }> {
  try {
    if (!razorpay) {
      return { success: false, message: 'Razorpay is not configured' };
    }

    // Verify signature
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (signature !== razorpaySignature) {
      return { success: false, message: 'Invalid signature' };
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (payment.status !== 'captured') {
      return { success: false, message: 'Payment not captured' };
    }

    // Update credits atomically
    await db.transaction(async (tx) => {
      // Get current credits
      const [userCredit] = await tx
        .select()
        .from(userCredits)
        .where(eq(userCredits.userId, userId));

      if (!userCredit) {
        throw new Error('User credits not found');
      }

      // Add credits
      await tx
        .update(userCredits)
        .set({ credits: sql`${userCredits.credits} + ${credits}` })
        .where(eq(userCredits.userId, userId));

      // Log transaction
      await tx.insert(creditTransactions).values({
        userId,
        change: credits,
        reason: 'PURCHASE',
        metadata: JSON.stringify({
          razorpayOrderId,
          razorpayPaymentId,
          amount: payment.amount,
          currency: payment.currency
        })
      });
    });

    return { success: true, message: 'Payment verified and credits added' };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { success: false, message: 'Payment verification failed' };
  }
}

/**
 * Get payment details from Razorpay
 */
export async function getPaymentDetails(paymentId: string): Promise<any> {
  try {
    if (!razorpay) {
      throw new Error('Razorpay is not configured');
    }
    return await razorpay.payments.fetch(paymentId);
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return null;
  }
}

/**
 * Refund payment (for failed orders, etc.)
 */
export async function refundPayment(
  paymentId: string,
  userId: number
): Promise<{ success: boolean; message: string }> {
  try {
    if (!razorpay) {
      return { success: false, message: 'Razorpay is not configured' };
    }

    const refund = await razorpay.payments.refund(paymentId, {});

    if (refund.status !== 'processed') {
      return { success: false, message: 'Refund failed' };
    }

    // Note: You may want to also update the credit transaction status
    // and log the refund in your database

    return { success: true, message: 'Refund processed successfully' };
  } catch (error) {
    console.error('Error refunding payment:', error);
    return { success: false, message: 'Refund failed' };
  }
}

/**
 * Get credit packages for purchase
 */
export function getCreditPackages() {
  return [
    {
      credits: 10,
      amount: 25000, // ₹250 in paise
      price: '₹250',
      savings: null
    },
    {
      credits: 50,
      amount: 99000, // ₹990 in paise (10% discount)
      price: '₹990',
      savings: '10%'
    },
    {
      credits: 100,
      amount: 179000, // ₹1790 in paise (20% discount)
      price: '₹1790',
      savings: '20%'
    },
    {
      credits: 200,
      amount: 299000, // ₹2990 in paise (25% discount)
      price: '₹2990',
      savings: '25%'
    }
  ];
}
