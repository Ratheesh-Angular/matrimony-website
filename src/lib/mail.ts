/**
 * Optional email notification hook for new enquiries.
 * Wire SMTP / Resend / etc. here when ready. No-op by default.
 */
export async function notifyEnquiryEmail(payload: {
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  type: string;
}) {
  if (!process.env.NOTIFY_EMAIL_TO) {
    return;
  }

  // Placeholder: log in development. Replace with your email provider.
  console.info("[enquiry notify]", {
    to: process.env.NOTIFY_EMAIL_TO,
    ...payload,
  });
}
