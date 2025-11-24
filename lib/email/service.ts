import { Resend } from 'resend';

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    if (!resend) {
      console.error('Resend is not configured. Email not sent to:', to);
      return { success: false, error: 'Email service not configured' };
    }

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@lekhai.com',
      to,
      subject,
      html
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}
