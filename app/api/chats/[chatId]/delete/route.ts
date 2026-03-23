import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { chats } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(_: Request, { params }: { params: Promise<{ chatId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { chatId } = await params;
  await db.delete(chats).where(and(eq(chats.id, chatId), eq(chats.userId, user.id)));
  return NextResponse.json({ message: 'Chat dihapus.' });
}
