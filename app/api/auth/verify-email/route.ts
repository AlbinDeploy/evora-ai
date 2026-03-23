import { NextResponse } from 'next/server';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { emailVerifications, users } from '@/db/schema';
import { publicAppUrl } from '@/lib/env';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.redirect(`${publicAppUrl}/login`);

  const [record] = await db
    .select()
    .from(emailVerifications)
    .where(and(eq(emailVerifications.token, token), eq(emailVerifications.purpose, 'verify_email'), isNull(emailVerifications.usedAt), gt(emailVerifications.expiresAt, new Date())));

  if (!record) return NextResponse.redirect(`${publicAppUrl}/login?verified=0`);

  await db.update(users).set({ emailVerified: true, updatedAt: new Date() }).where(eq(users.id, record.userId));
  await db.update(emailVerifications).set({ usedAt: new Date() }).where(eq(emailVerifications.id, record.id));
  return NextResponse.redirect(`${publicAppUrl}/login?verified=1`);
}
