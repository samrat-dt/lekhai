import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/payments/razorpay';
import crypto from 'crypto';

/**
 * Razorpay Webhook Handler
 * Handles payment.authorized, payment.failed, payment.captured events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(body);
    const event = payload.event;
    const data = payload.payload;

    // Handle payment.authorized event (when payment is authorized before capturing)
    if (event === 'payment.authorized') {
      // You might want to capture the payment here
      console.log('Payment authorized:', data.payment);
    }

    // Handle payment.failed event
    if (event === 'payment.failed') {
      console.log('Payment failed:', data.payment);
      // You can log this failure in your database
    }

    // Handle payment.captured event
    if (event === 'payment.captured') {
      const payment = data.payment;
      const notes = payment.notes;

      if (notes && notes.userId && notes.credits) {
        const userId = parseInt(notes.userId);
        const credits = parseInt(notes.credits);

        // Verify payment using the order ID and payment ID
        const orderDetails = await request.json().catch(() => ({}));

        const result = await verifyPayment(
          payment.order_id,
          payment.id,
          signature,
          userId,
          credits
        );

        if (!result.success) {
          console.error('Payment verification failed:', result.message);
          return NextResponse.json(
            { error: result.message },
            { status: 400 }
          );
        }

        console.log('Payment verified and credits added:', {
          userId,
          credits,
          paymentId: payment.id
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
