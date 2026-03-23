import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { chats } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await db.select().from(chats).where(eq(chats.userId, user.id)).orderBy(desc(chats.updatedAt));
  return NextResponse.json({ chats: items });
}
