import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { createSession } from '@/lib/auth';
import { verifyPassword } from '@/lib/crypto';
import { enforceRateLimit } from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'local';
    enforceRateLimit({ key: `login:${ip}`, limit: 10, windowMs: 10 * 60 * 1000 });

    const formData = await request.formData();
    const parsed = loginSchema.parse({
      email: String(formData.get('email') || '').toLowerCase().trim(),
      password: String(formData.get('password') || ''),
    });

    const [user] = await db.select().from(users).where(eq(users.email, parsed.email));
    if (!user) return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });
    if (!user.emailVerified) return NextResponse.json({ error: 'Email belum diverifikasi.' }, { status: 403 });

    const valid = await verifyPassword(parsed.password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: 'Email atau password salah.' }, { status: 401 });

    await createSession({ id: user.id, email: user.email });
    return NextResponse.json({ message: 'Login sukses.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Login gagal' }, { status: 400 });
  }
}
