import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/payments/razorpay';
import { getUser } from '@/lib/db/queries';
import { z } from 'zod';

const createOrderSchema = z.object({
  credits: z.number().positive('Credits must be positive'),
  amount: z.number().positive('Amount must be positive')
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { credits, amount } = createOrderSchema.parse(body);

    const orderDetails = await createOrder({
      userId: user.id,
      credits,
      amount
    });

    if (!orderDetails) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    return NextResponse.json(orderDetails);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
