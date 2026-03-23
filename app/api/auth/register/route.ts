import { NextResponse } from 'next/server';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { emailVerifications, users } from '@/db/schema';
import { hashPassword } from '@/lib/crypto';
import { sendEmail } from '@/lib/email';
import { publicAppUrl } from '@/lib/env';
import { enforceRateLimit } from '@/lib/rate-limit';
import { createToken } from '@/lib/tokens';
import { sanitizeText } from '@/lib/utils';
import { registerSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'local';
    enforceRateLimit({ key: `register:${ip}`, limit: 5, windowMs: 10 * 60 * 1000 });

    const formData = await request.formData();
    const parsed = registerSchema.parse({
      name: sanitizeText(String(formData.get('name') || '')),
      email: String(formData.get('email') || '').toLowerCase().trim(),
      password: String(formData.get('password') || ''),
    });

    const [existing] = await db.select().from(users).where(eq(users.email, parsed.email));
    if (existing) return NextResponse.json({ error: 'Email sudah kepakai.' }, { status: 409 });

    const [user] = await db.insert(users).values({
      name: parsed.name,
      email: parsed.email,
      passwordHash: await hashPassword(parsed.password),
    }).returning();

    const token = createToken();
    await db.insert(emailVerifications).values({
      userId: user.id,
      token,
      purpose: 'verify_email',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    await sendEmail({
      to: user.email,
      subject: 'Verifikasi akun Evora AI',
      html: `<p>Halo ${user.name}, klik link ini buat verifikasi akun:</p><p><a href="${publicAppUrl}/api/auth/verify-email?token=${token}">Verifikasi email</a></p>`,
    });

    return NextResponse.json({ message: 'Register sukses. Cek email buat verifikasi akun.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Register gagal' }, { status: 400 });
  }
}
