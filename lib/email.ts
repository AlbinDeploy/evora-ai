import { Resend } from 'resend';
import { env } from './env';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  return resend.emails.send({
    from: `Evora AI <${env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}
