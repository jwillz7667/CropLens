import { Resend } from 'resend';
import { Twilio } from 'twilio';

const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey ? new Resend(resendKey) : undefined;

const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_FROM_NUMBER;
const twilio = twilioSid && twilioToken ? new Twilio(twilioSid, twilioToken) : undefined;

export const sendInsightEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  if (!resend) {
    console.warn('Resend key missing; skipping email send.');
    return;
  }
  await resend.emails.send({
    from: 'CropLens Alerts <alerts@croplens.app>',
    to,
    subject,
    html,
  });
};

export const sendInsightSms = async ({ to, body }: { to: string; body: string }) => {
  if (!twilio || !twilioFrom) {
    console.warn('Twilio credentials missing; skipping SMS send.');
    return;
  }
  await twilio.messages.create({ to, from: twilioFrom, body });
};
