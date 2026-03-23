import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { emailVerifications, users } from '@/db/schema';
import { sendEmail } from '@/lib/email';
import { publicAppUrl } from '@/lib/env';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createToken } from '@/lib/tokens';
import { forgotSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'local';
    enforceRateLimit({ key: `forgot:${ip}`, limit: 5, windowMs: 10 * 60 * 1000 });

    const formData = await request.formData();
    const parsed = forgotSchema.parse({ email: String(formData.get('email') || '').trim().toLowerCase() });
    const [user] = await db.select().from(users).where(eq(users.email, parsed.email));

    if (user) {
      const token = createToken();
      await db.insert(emailVerifications).values({
        userId: user.id,
        token,
        purpose: 'reset_password',
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      });
      await sendEmail({
        to: user.email,
        subject: 'Reset password Evora AI',
        html: `<p>Klik link ini buat reset password:</p><p><a href="${publicAppUrl}/reset-password?token=${token}">Reset password</a></p>`,
      });
    }

    return NextResponse.json({ message: 'Kalau email terdaftar, link reset sudah dikirim.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Reset gagal' }, { status: 400 });
  }
}
