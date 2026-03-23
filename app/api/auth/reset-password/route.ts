import { NextResponse } from 'next/server';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { emailVerifications, users } from '@/db/schema';
import { hashPassword } from '@/lib/crypto';
import { resetSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = resetSchema.parse({
      token: String(formData.get('token') || ''),
      password: String(formData.get('password') || ''),
    });

    const [record] = await db
      .select()
      .from(emailVerifications)
      .where(and(eq(emailVerifications.token, parsed.token), eq(emailVerifications.purpose, 'reset_password'), isNull(emailVerifications.usedAt), gt(emailVerifications.expiresAt, new Date())));

    if (!record) return NextResponse.json({ error: 'Token reset nggak valid atau sudah expired.' }, { status: 400 });

    await db.update(users).set({ passwordHash: await hashPassword(parsed.password), updatedAt: new Date() }).where(eq(users.id, record.userId));
    await db.update(emailVerifications).set({ usedAt: new Date() }).where(eq(emailVerifications.id, record.id));

    return NextResponse.json({ message: 'Password berhasil diganti.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Reset gagal' }, { status: 400 });
  }
}
