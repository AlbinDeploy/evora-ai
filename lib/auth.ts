import { cookies, headers } from 'next/headers';
import { and, eq, gt } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '@/db';
import { sessions, users } from '@/db/schema';
import { signSession, verifySession } from './jwt';

const COOKIE_NAME = 'evora_session';

export async function createSession(user: { id: string; email: string }) {
  const tokenId = nanoid();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const headerStore = await headers();
  await db.insert(sessions).values({
    userId: user.id,
    tokenId,
    expiresAt,
    userAgent: headerStore.get('user-agent') || 'unknown',
    ipAddress: headerStore.get('x-forwarded-for') || 'unknown',
  });

  const token = await signSession({ userId: user.id, tokenId, email: user.email });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      const payload = await verifySession(token);
      await db.delete(sessions).where(eq(sessions.tokenId, payload.tokenId));
    } catch {}
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = await verifySession(token);
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tokenId, payload.tokenId), gt(sessions.expiresAt, new Date())));

    if (!session) return null;

    const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
    return user || null;
  } catch {
    return null;
  }
}
