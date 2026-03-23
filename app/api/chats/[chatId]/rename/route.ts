import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { chats } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { sanitizeText } from '@/lib/utils';

export async function PATCH(request: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { chatId } = await params;
  const { title } = await request.json();
  await db.update(chats).set({ title: sanitizeText(String(title || '')).slice(0, 80), updatedAt: new Date() }).where(and(eq(chats.id, chatId), eq(chats.userId, user.id)));
  return NextResponse.json({ message: 'Chat diubah.' });
}
