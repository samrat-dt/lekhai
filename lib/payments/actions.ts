'use server';

import { redirect } from 'next/navigation';

// Payment actions - currently Razorpay integration
// Stripe integration has been removed
export const checkoutAction = async () => {
  redirect('/pricing');
};

export const customerPortalAction = async () => {
  redirect('/pricing');
};
