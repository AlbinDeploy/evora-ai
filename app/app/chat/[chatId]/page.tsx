import { and, asc, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ChatShell } from '@/components/chat/chat-shell';
import { db } from '@/db';
import { chats, messages } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  if (chatId === 'new') {
    return <ChatShell chatId="new" initialMessages={[]} />;
  }

  const [chat] = await db.select().from(chats).where(and(eq(chats.id, chatId), eq(chats.userId, user.id)));
  if (!chat) notFound();

  const items = await db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(asc(messages.createdAt));

  return (
    <ChatShell
      chatId={chatId}
      initialMessages={items.map((item) => ({ id: item.id, role: item.role as 'user' | 'assistant', content: item.content }))}
    />
  );
}
